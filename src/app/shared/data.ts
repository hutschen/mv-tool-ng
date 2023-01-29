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

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable } from 'rxjs';
import { Filterable } from './filter';
import { IQueryParams } from './services/crud.service';

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

export class DataColumn<D extends IDataItem> extends Filterable {
  constructor(
    public dataField: DataField<D, any>,
    public hide: boolean = false
  ) {
    super();
  }

  get name(): string {
    return this.dataField.name;
  }

  get label(): string {
    return this.dataField.label;
  }

  set optional(optional: boolean) {
    this.dataField.optional = optional;
  }

  get optional(): boolean {
    return this.dataField.optional;
  }

  isShown(dataArray: D[]): boolean {
    const fieldIsShown = dataArray.some((data) => this.dataField.isShown(data));
    return !this.hide && (!this.optional || fieldIsShown);
  }
}

export class PlaceholderColumn<D extends IDataItem> extends DataColumn<D> {
  constructor(
    name: string,
    label: string | null = null,
    hide: boolean = false
  ) {
    super(new PlaceholderField(name, label), hide);
  }
}

export class Sortable {
  private __matSort?: MatSort;

  set matSort(matSort: MatSort | undefined) {
    this.__matSort = matSort;
  }

  get sortBy(): string | void {
    return this.__matSort?.active;
  }

  get sortOrder(): 'asc' | 'desc' | void {
    const sortOrder = this.__matSort?.direction;
    return sortOrder !== '' ? sortOrder : undefined;
  }

  get queryParams(): IQueryParams {
    const queryParams: IQueryParams = {};
    if (this.sortOrder && this.sortBy) {
      queryParams['sort_by'] = this.sortBy;
      queryParams['sort_order'] = this.sortOrder;
    }
    return queryParams;
  }
}

export class DataFrame<D extends IDataItem> extends Sortable {
  protected _dataSubject: BehaviorSubject<D[]>;
  data$: Observable<D[]>;

  constructor(public columns: DataColumn<D>[] = [], data: D[] = []) {
    super();
    this._dataSubject = new BehaviorSubject(data);
    this.data$ = this._dataSubject.asObservable();
  }

  get data(): D[] {
    return this._dataSubject.getValue();
  }

  set data(data: D[]) {
    this._dataSubject.next(data);
  }

  override get queryParams(): IQueryParams {
    const queryParams: IQueryParams = {};
    for (const column of this.columns) {
      Object.assign(queryParams, column.queryParams);
    }
    Object.assign(super.queryParams, this.queryParams);
    return queryParams;
  }

  addColumn(field: DataField<D, any>, hide: boolean = false): DataColumn<D> {
    const column = new DataColumn(field, hide);
    this.columns.push(column);
    return column;
  }

  addItem(item: D): boolean {
    this.data.push(item);
    this._dataSubject.next(this.data);
    return true;
  }

  updateItem(item: D): boolean {
    const index = this.data.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      this.data[index] = item;
      this._dataSubject.next(this.data);
      return true;
    }
    return false;
  }

  addOrUpdateItem(item: D): boolean {
    return this.updateItem(item) ?? this.addItem(item);
  }

  removeItem(item: D): void {
    const index = this.data.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      this.data.splice(index, 1);
      this._dataSubject.next(this.data);
    }
  }

  getColumn(name: string): DataColumn<D> {
    const column = this.columns.find((column) => column.name === name);
    if (column) return column;
    else throw new Error(`Column ${name} not found`);
  }

  get shownColumns(): DataColumn<D>[] {
    return this.columns.filter((column) => column.isShown(this.data));
  }
}

export class DataPage<D extends IDataItem> extends DataFrame<D> {
  private __matPaginator?: MatPaginator;

  set paginator(paginator: MatPaginator) {
    this.__matPaginator = paginator;
  }

  get page(): number {
    if (this.__matPaginator) {
      return this.__matPaginator.pageIndex + 1;
    } else throw new Error('Paginator not set');
  }

  get pageSize(): number {
    if (this.__matPaginator) {
      return this.__matPaginator.pageSize;
    } else throw new Error('Paginator not set');
  }

  override get queryParams(): IQueryParams {
    const queryParams = super.queryParams;
    queryParams['page'] = this.page;
    queryParams['page_size'] = this.pageSize;
    return queryParams;
  }

  override addItem(item: D): boolean {
    if (this.data.length < this.pageSize) {
      return super.addItem(item);
    }
    return false;
  }
}
