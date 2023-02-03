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

import { isEqual } from 'radash';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  startWith,
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
  public label: string;

  constructor(
    public name: string,
    label: string | null = null,
    public optional: boolean = true
  ) {
    this.label = label ?? name;
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

  constructor(
    public readonly field: DataField<D, any>,
    filters: Filters | null = null,
    public hide: boolean = false
  ) {
    this.name = field.name;
    this.label = field.label;
    this.filters = filters ?? new Filters(this.field.label);
  }

  set optional(optional: boolean) {
    this.field.optional = optional;
  }

  get optional(): boolean {
    return this.field.optional;
  }

  isShown(dataArray: D[]): boolean {
    const fieldIsShown = dataArray.some((data) => this.field.isShown(data));
    return !this.hide && (!this.optional || fieldIsShown);
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

export class DataFrame<D extends IDataItem> {
  protected _isLoadingData: boolean = true;
  protected _isLoadingColumns: boolean = true;
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
    public readonly columns: DataColumn<D>[],
    search: Search | null = null,
    sort: Sorting | null = null,
    usePagination: boolean = true
  ) {
    this.search = search ?? new Search();
    this.sort = sort ?? new Sorting();
    this.pagination = new Paginator(usePagination);

    // Combine all query parameters
    this.queryParams$ = combineLatest([
      this.search.queryParams$.pipe(tap(() => this.pagination.toFirstPage())),
      this.sort.queryParams$.pipe(tap(() => this.pagination.toFirstPage())),
      this.pagination.queryParams$,
      ...this.columns.map((column) =>
        column.filters.queryParams$.pipe(
          tap(() => this.pagination.toFirstPage())
        )
      ),
    ]).pipe(
      debounceTime(250),
      distinctUntilChanged(isEqual),
      map((queryParams) =>
        queryParams.reduce((acc, val) => ({ ...acc, ...val }), {})
      )
    );

    // Get names of columns that are shown
    this.columnNames$ = this.data$.pipe(
      map((data) => this.columns.filter((column) => column.isShown(data))),
      map((columns) => columns.map((column) => column.name))
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

  getColumn(name: string): DataColumn<D> {
    const column = this.columns.find((column) => column.name === name);
    if (column) return column;
    else throw new Error(`Column ${name} not found`);
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
