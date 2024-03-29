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
  delay,
  distinctUntilChanged,
  first,
  map,
  Observable,
  of,
  skip,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Filters } from './filter';
import { Paginator } from './page';
import { Search } from './search';
import { IQueryParams } from '../services/query-params.service';
import { Sorting } from './sort';
import { IPage } from '../services/crud.service';
import { IInteractionService } from './interaction';

export interface IDataItem {
  id: number | string;
}

export class DataField<D extends IDataItem, V> {
  public readonly required: boolean;
  public readonly label: string;
  protected _optionalSubject: BehaviorSubject<boolean>;
  public readonly optional$: Observable<boolean>;

  constructor(
    public name: string,
    label: string | null = null,
    optional: boolean = true
  ) {
    this.label = label ?? title(name);
    this.required = !optional;
    this._optionalSubject = new BehaviorSubject<boolean>(optional);
    this.optional$ = this._optionalSubject.asObservable();
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
    this._optionalSubject.next(!this.required && optional);
  }

  get optional(): boolean {
    return this._optionalSubject.value;
  }

  isShown(data: D): Observable<boolean> {
    return this.optional$.pipe(
      map((optional) => !optional || this.toBool(data)),
      distinctUntilChanged()
    );
  }
}

// TODO: use any instead of type D
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
    initQueryParams: IQueryParams = {}
  ) {
    this.name = field.name;
    this.label = field.label;
    this.filters = filters ?? new Filters(this.field.label);

    this._hiddenSubject = new BehaviorSubject<boolean>(
      !this.required && this.__evalQueryParams(initQueryParams)
    );
    this.hidden$ = this._hiddenSubject.asObservable();
  }

  private __evalQueryParams(initialQueryParams: IQueryParams): boolean {
    // Check if column is mentioned in _hidden_columns property of query params
    const { _hidden_columns } = initialQueryParams;
    if (_hidden_columns) {
      if (Array.isArray(_hidden_columns)) {
        return _hidden_columns.includes(this.name);
      } else {
        return _hidden_columns === this.name;
      }
    }
    return false;
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
    this._hiddenSubject.next(!this.required && hide);
  }

  get hidden(): boolean {
    return this._hiddenSubject.value;
  }

  isShown(dataArray: D[]): Observable<boolean> {
    return combineLatest([this.hidden$, this.field.optional$]).pipe(
      switchMap(([hidden, optional]) => {
        if (hidden) return of(false);
        if (!optional) return of(true);
        if (dataArray.length === 0) return of(false);

        return combineLatest(
          dataArray.map((data) => this.field.isShown(data))
        ).pipe(map((shownArray) => shownArray.some((shown) => shown)));
      }),
      distinctUntilChanged()
    );
  }
}

export class PlaceholderColumn<D extends IDataItem> extends DataColumn<D> {
  constructor(
    name: string,
    label: string | null = null,
    initQueryParams: IQueryParams = {}
  ) {
    super(new PlaceholderField(name, label), null, initQueryParams);
  }
}

export class DataColumns<D extends IDataItem> {
  public readonly hideableColumns: readonly DataColumn<D>[];
  public readonly hiddenQueryParams$: Observable<IQueryParams>;
  public readonly filterQueryParams$: Observable<IQueryParams>;
  readonly areColumnsHidden$: Observable<boolean>;
  readonly areFiltersSet$: Observable<boolean>;

  constructor(public readonly columns: readonly DataColumn<D>[]) {
    // ensure that all columns have unique names
    const names = this.columns.map((column) => column.name);
    if (names.length !== new Set(names).size) {
      throw new Error('Column names must be unique');
    }

    // set hideable columns
    this.hideableColumns = this.columns.filter((column) => !column.required);

    // combine hidden status of columns into query params
    this.hiddenQueryParams$ = combineLatest(
      this.columns.map((column) => column.hidden$)
    ).pipe(
      distinctUntilChanged(isEqual),
      map(() =>
        this.columns
          .filter((column) => column.hidden)
          .map((column) => column.name)
      ),
      map((hiddenColumns) => {
        if (hiddenColumns.length) return { _hidden_columns: hiddenColumns };
        else return {} as IQueryParams;
      })
    );

    // check if any columns are hidden
    this.areColumnsHidden$ = combineLatest(
      this.columns.map((column) => column.hidden$)
    ).pipe(
      map((hiddenArray) => hiddenArray.some((hidden) => hidden)),
      distinctUntilChanged()
    );

    // check if any filters are set
    this.areFiltersSet$ = combineLatest(
      this.columns.map((column) => column.filters.isSet$)
    ).pipe(
      map((isSetArray) => isSetArray.some((isSet) => isSet)),
      distinctUntilChanged()
    );

    // combine filter values of columns into query params
    this.filterQueryParams$ = combineLatest(
      this.columns.map((column) => column.filters.queryParams$)
    ).pipe(
      map((queryParams) => Object.assign({}, ...queryParams)),
      distinctUntilChanged(isEqual)
    );
  }

  getColumn(name: string): DataColumn<D> {
    const column = this.columns.find((column) => column.name === name);
    if (column) return column;
    else throw new Error(`Column ${name} not found`);
  }

  getShownColumns(dataArray: D[]): Observable<DataColumn<D>[]> {
    return combineLatest(
      this.columns.map((column) => column.isShown(dataArray))
    ).pipe(
      distinctUntilChanged(isEqual),
      map((shownArray) =>
        this.columns.filter((column, index) => shownArray[index])
      )
    );
  }

  clearFilters(): void {
    this.columns.forEach((column) => column.filters.clear());
  }

  unhideAllColumns(): void {
    this.columns.forEach((column) => (column.hidden = false));
  }
}

// TODO: make this class abstract
export class DataFrame<D extends IDataItem> {
  public readonly columns: DataColumns<D>;
  protected _isLoadingData: boolean = false;
  protected _isLoadingColumns: boolean = false;
  protected _reloadSubject: Subject<void> = new Subject();
  protected _dataSubject: BehaviorSubject<D[]> = new BehaviorSubject<D[]>([]);
  readonly data$: Observable<D[]> = this._dataSubject.asObservable();
  readonly columnNames$: Observable<string[]>;
  readonly queryParams$: Observable<IQueryParams>;
  protected _lengthSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  readonly length$: Observable<number> = this._lengthSubject.asObservable();
  readonly search: Search;
  readonly sort: Sorting;
  readonly pagination: Paginator;

  constructor(
    columns: DataColumn<D>[] | DataColumns<D>,
    initQueryParams: IQueryParams = {},
    search: Search | null = null,
    sort: Sorting | null = null,
    paginator: Paginator | null = null,
    reloadDelay: number = 500
  ) {
    this.columns = Array.isArray(columns) ? new DataColumns(columns) : columns;
    this.search = search ?? new Search(initQueryParams);
    this.sort = sort ?? new Sorting(initQueryParams);
    this.pagination = paginator ?? new Paginator(initQueryParams);

    // Switch to first page when search, sort, or filters change
    combineLatest([
      this.search.queryParams$,
      this.sort.queryParams$,
      this.columns.filterQueryParams$,
    ])
      .pipe(skip(1)) // skip initial values
      .subscribe(() => this.pagination.toFirstPage());

    // Combine query params sent to the server
    const dataQueryParams$ = combineLatest([
      this.search.queryParams$,
      this.sort.queryParams$,
      this.columns.filterQueryParams$,
      this.pagination.queryParams$,
    ]).pipe(
      map((queryParams) => Object.assign({}, ...queryParams)),
      distinctUntilChanged(isEqual)
    );

    // Add client-side query params to server-side query params
    // Names of client-side query params begin with an underscore
    this.queryParams$ = combineLatest([
      dataQueryParams$,
      this.columns.hiddenQueryParams$,
    ]).pipe(
      map((queryParams) => Object.assign({}, ...queryParams)),
      distinctUntilChanged(isEqual)
    );

    // Get names of columns that are shown
    this.columnNames$ = this.data$.pipe(
      switchMap((data) => this.columns.getShownColumns(data)),
      map((columns) => columns.map((column) => column.name)),
      distinctUntilChanged(isEqual)
    );

    // Load and set non-optional columns
    combineLatest([this._reloadSubject.pipe(first()), this.data$])
      .pipe(
        tap(() => (this._isLoadingColumns = true)),
        switchMap(() => this.getColumnNames()),
        tap(() => (this._isLoadingColumns = false))
      )
      .subscribe((names) => {
        this.columns.columns.forEach((column) => {
          column.optional = !names.includes(column.name);
        });
      });

    // Load data
    combineLatest([
      this._reloadSubject,
      dataQueryParams$.pipe(
        // delay second and subsequent emissions similar to debounceTime
        switchMap((queryParams, index) => {
          if (index === 0) return of(queryParams);
          else return of(queryParams).pipe(delay(reloadDelay));
        })
      ),
    ])
      .pipe(
        map(([, queryParams]) => queryParams),
        tap(() => (this._isLoadingData = true)),
        switchMap((queryParams) => this.getData(queryParams)),
        tap(() => (this._isLoadingData = false))
      )
      .subscribe((data) => {
        if (Array.isArray(data)) {
          this._dataSubject.next(data);
          this._lengthSubject.next(data.length);
        } else {
          this._dataSubject.next(data.items);
          this._lengthSubject.next(data.total_count);
        }
      });
  }

  get isLoading(): boolean {
    return this._isLoadingData || this._isLoadingColumns;
  }

  get length(): number {
    return this._lengthSubject.value;
  }

  addItem(item: D): boolean {
    // FIXME: prevent adding duplicate items (items need unique ids)
    const data = this._dataSubject.value;
    this._lengthSubject.next(this._lengthSubject.value + 1);

    // Only add item if pagination is disabled or page is not full
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
    this._lengthSubject.next(this._lengthSubject.value - 1);
    if (index >= 0) {
      // Remove item from data
      data.splice(index, 1);
      this._dataSubject.next(data);

      if (this.pagination.enabled) {
        // If page is not the last page, reload the page to fill the gap
        if (!this.pagination.isLastPage(this.length + 1)) {
          this.reload();
        } else if (data.length === 0) {
          // If page is the last page, which is now empty, switch to the previous page
          this.pagination.toPreviousPage();
        }
      }
      return true;
    }
    return false;
  }

  syncInteractions(interactionService: IInteractionService<D>) {
    interactionService.interactions$.subscribe((interaction) => {
      switch (interaction.action) {
        case 'add':
          this.addItem(interaction.item);
          break;
        case 'update':
          this.updateItem(interaction.item);
          break;
        case 'delete':
          this.removeItem(interaction.item);
          break;
      }
    });
  }

  reload(): void {
    this._reloadSubject.next();
  }

  getColumnNames(): Observable<string[]> {
    return of([]);
  }

  getData(queryParams: IQueryParams): Observable<D[] | IPage<D>> {
    return of([]);
  }
}
