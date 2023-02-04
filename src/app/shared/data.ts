// Copyright (C) 2023 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { isEqual, title } from 'radash';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Filters } from './filter';
import { Paginator } from './page';
import { Search } from './search';
import { IQueryParams } from './services/crud.service';
import { Sorting } from './sort';

export interface IDataItem {
  id: number | string;
}

export class DataField<D extends IDataItem, V> {
  public readonly required: boolean;
  public readonly label: string;

  constructor(
    public name: string,
    label: string | null = null,
    protected _optional: boolean = true
  ) {
    this.label = label ?? title(name);
    this.required = !this._optional;
  }

  toValue(data: D): V {
    if (this.name in data) {
      return data[this.name as keyof D] as V;
    } else throw new Error(`Property ${this.name} not found in ${data}`);
  }

  toStr(data: D): string {
    return String(this.toValue(data) ?? '');
  }

  toBool(data: D): boolean {
    return Boolean(this.toValue(data));
  }

  set optional(optional: boolean) {
    this._optional = optional;
  }

  get optional(): boolean {
    return !this.required && this._optional;
  }

  isShown(data: D): boolean {
    return !this.optional || this.toBool(data);
  }
}

export class PlaceholderField<D extends IDataItem> extends DataField<D, any> {
  constructor(name: string, label: string | null = null) {
    super(name, label, false);
  }

  override toValue(data: D): any {
    return null;
  }
}

export class DataColumn<D extends IDataItem> {
  public readonly name: string;
  public readonly label: string;
  public readonly filters: Filters;
  protected readonly _hiddenSubject: BehaviorSubject<boolean>;
  public readonly hidden$: Observable<boolean>;

  constructor(
    public readonly field: DataField<D, any>,
    filters: Filters | null = null,
    hidden: boolean = false
  ) {
    this.name = field.name;
    this.label = field.label;
    this.filters = filters ?? new Filters(this.field.label);

    this._hiddenSubject = new BehaviorSubject<boolean>(hidden);
    this.hidden$ = this._hiddenSubject.asObservable();
    // .pipe(distinctUntilChanged());
  }

  get required(): boolean {
    return this.field.required;
  }

  set optional(optional: boolean) {
    this.field.optional = optional;
  }

  get optional(): boolean {
    return this.field.optional;
  }

  set hidden(hide: boolean) {
    this._hiddenSubject.next(hide);
  }

  get hidden(): boolean {
    return !this.required && this._hiddenSubject.value;
  }

  isShown(dataArray: D[]): boolean {
    const fieldIsShown = dataArray.some((data) => this.field.isShown(data));
    return !this.hidden && (!this.optional || fieldIsShown);
  }
}

export class PlaceholderColumn<D extends IDataItem> extends DataColumn<D> {
  constructor(
    name: string,
    label: string | null = null,
    hide: boolean = false
  ) {
    super(new PlaceholderField(name, label), null, hide);
  }
}

export class DataColumns<D extends IDataItem> {
  protected readonly _columns: DataColumn<D>[]; // columns in order
  protected readonly _columnsMap: Map<string, DataColumn<D>>;
  public readonly hideableColumns: DataColumn<D>[];
  public readonly hiddenQueryParams$: Observable<IQueryParams>;
  public readonly filterQueryParams$: Observable<IQueryParams>;

  constructor(columns: DataColumn<D>[]) {
    // ensure that all columns have unique names
    const names = columns.map((column) => column.name);
    if (names.length !== new Set(names).size) {
      throw new Error('Column names must be unique');
    }

    // set columns and columns map
    this._columns = columns;
    this._columnsMap = new Map(columns.map((column) => [column.name, column]));

    // set hideable columns
    this.hideableColumns = columns.filter((column) => !column.required);

    // combine hidden status of columns into query params
    this.hiddenQueryParams$ = combineLatest(
      columns.map((column) => column.hidden$)
    ).pipe(
      distinctUntilChanged(isEqual),
      map(() =>
        columns.filter((column) => column.hidden).map((column) => column.name)
      ),
      map((hiddenColumns) => {
        if (hiddenColumns.length) return { _hidden_columns: hiddenColumns };
        else return {} as IQueryParams;
      })
    );

    // combine filter values of columns into query params
    this.filterQueryParams$ = combineLatest(
      columns.map((column) => column.filters.queryParams$)
    ).pipe(
      map((queryParams) => Object.assign({}, ...queryParams)),
      distinctUntilChanged(isEqual)
    );
  }

  getColumn(name: string): DataColumn<D> {
    const column = this._columnsMap.get(name);
    if (column) return column;
    else throw new Error(`Column ${name} not found`);
  }

  // implement map
  map<T>(callbackfn: (value: DataColumn<D>, index: number) => T): T[] {
    return this._columns.map(callbackfn);
  }

  // implement filter
  filter(
    callbackfn: (value: DataColumn<D>, index: number) => unknown
  ): DataColumn<D>[] {
    return this._columns.filter(callbackfn);
  }

  // implement find
  find(
    callbackfn: (value: DataColumn<D>, index: number) => unknown
  ): DataColumn<D> | undefined {
    return this._columns.find(callbackfn);
  }

  // implement forEach
  forEach(callbackfn: (value: DataColumn<D>, index: number) => void): void {
    this._columns.forEach(callbackfn);
  }
}

export class DataFrame<D extends IDataItem> {
  public readonly columns: DataColumns<D>;
  protected _isLoadingData: boolean = true;
  protected _isLoadingColumns: boolean = true;
  protected _reloadSubject: Subject<void> = new Subject();
  protected _dataSubject: BehaviorSubject<D[]> = new BehaviorSubject<D[]>([]);
  readonly data$: Observable<D[]> = this._dataSubject.asObservable();
  readonly columnNames$: Observable<string[]>;
  readonly areFiltersSet$: Observable<boolean>;
  readonly queryParams$: Observable<IQueryParams>;
  protected _lengthSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  readonly length$: Observable<number> = this._lengthSubject.asObservable();
  readonly search: Search;
  readonly sort: Sorting;
  readonly pagination: Paginator;

  constructor(
    columns: DataColumn<D>[] | DataColumns<D>,
    search: Search | null = null,
    sort: Sorting | null = null,
    usePagination: boolean = true
  ) {
    this.columns = Array.isArray(columns) ? new DataColumns(columns) : columns;
    this.search = search ?? new Search();
    this.sort = sort ?? new Sorting();
    this.pagination = new Paginator(usePagination);

    // Combine all query parameters
    this.queryParams$ = combineLatest([
      this.search.queryParams$.pipe(tap(() => this.pagination.toFirstPage())),
      this.sort.queryParams$.pipe(tap(() => this.pagination.toFirstPage())),
      this.pagination.queryParams$,
      this.columns.hiddenQueryParams$,
      this.columns.filterQueryParams$.pipe(
        tap(() => this.pagination.toFirstPage())
      ),
    ]).pipe(
      debounceTime(250),
      map((queryParams) => Object.assign({}, ...queryParams)),
      distinctUntilChanged(isEqual)
    );

    // Get names of columns that are shown
    this.columnNames$ = this.data$.pipe(
      map((data) => this.columns.filter((column) => column.isShown(data))),
      map((columns) => columns.map((column) => column.name))
    );

    // Check if any filters are set
    this.areFiltersSet$ = combineLatest(
      this.columns.map((c) => c.filters.isSet$)
    ).pipe(
      map((isSet) => isSet.some((set) => set)),
      distinctUntilChanged((x, y) => x === y)
    );

    // Define observable to trigger reload
    const reload$ = combineLatest([
      this._reloadSubject,
      this.queryParams$,
    ]).pipe(map(([, queryParams]) => queryParams));

    // Reload and set names of required columns
    const initialNames = this.columns
      .filter((column) => !column.optional)
      .map((column) => column.name);
    reload$
      .pipe(
        tap(() => (this._isLoadingColumns = true)),
        switchMap(() => this.getColumnNames()),
        tap(() => (this._isLoadingColumns = false)),
        map((names) => [...initialNames, ...names])
      )
      .subscribe((names) => {
        this.columns.forEach((column) => {
          column.optional = !names.includes(column.name);
        });
      });

    // Reload data
    reload$
      .pipe(
        tap(() => (this._isLoadingData = true)),
        switchMap((queryParams) => this.getData(queryParams)),
        tap(() => (this._isLoadingData = false))
      )
      .subscribe((data) => this._dataSubject.next(data));
  }

  get isLoading(): boolean {
    return this._isLoadingData || this._isLoadingColumns;
  }

  set length(length: number) {
    this._lengthSubject.next(length);
  }

  addItem(item: D): boolean {
    const data = this._dataSubject.value;
    if (
      !this.pagination.enabled ||
      data.length < this.pagination.page.pageSize
    ) {
      data.push(item);
      this._dataSubject.next(data);
      return true;
    }
    return false;
  }

  updateItem(item: D): boolean {
    const data = this._dataSubject.value;
    const index = data.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      data[index] = item;
      this._dataSubject.next(data);
      return true;
    }
    return false;
  }

  addOrUpdateItem(item: D): boolean {
    return this.updateItem(item) || this.addItem(item);
  }

  removeItem(item: D): boolean {
    const data = this._dataSubject.value;
    const index = data.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      // Remove item from data
      data.splice(index, 1);
      this._dataSubject.next(data);

      // Reload if page is not the last page
      if (
        !this.pagination.enabled ||
        data.length + 1 === this.pagination.page.pageSize
      ) {
        this.reload();
      }
      return true;
    }
    return false;
  }

  clearAllFilters(): void {
    this.columns.forEach((column) => column.filters.clear());
  }

  reload(): void {
    this._reloadSubject.next();
  }

  getColumnNames(): Observable<string[]> {
    return of([]);
  }

  getData(queryParams: IQueryParams): Observable<D[]> {
    return of([]);
  }
}
