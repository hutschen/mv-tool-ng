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

export class DataPage<D extends IDataItem> {
  protected _dataSubject: BehaviorSubject<D[]>;
  data$: Observable<D[]>;

  constructor(public columns: DataColumn<D>[], data: D[] = []) {
    this._dataSubject = new BehaviorSubject(data);
    this.data$ = this._dataSubject.asObservable();
  }

  get data(): D[] {
    return this._dataSubject.getValue();
  }

  set data(data: D[]) {
    this._dataSubject.next(data);
  }

  get queryParams(): IQueryParams {
    const queryParams: IQueryParams = {};
    for (const column of this.columns) {
      Object.assign(queryParams, column.queryParams);
    }
    return queryParams;
  }

  addItem(item: D, max_item_count: number = 0): D | void {
    if (max_item_count <= 0 || this.data.length < max_item_count) {
      this.data.push(item);
      this._dataSubject.next(this.data);
      return item;
    }
  }

  updateItem(item: D): D | void {
    const index = this.data.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      this.data[index] = item;
      this._dataSubject.next(this.data);
      return item;
    }
  }

  addOrUpdateItem(item: D, max_item_count: number = 0): D | void {
    if (this.updateItem(item)) return item;
    else return this.addItem(item, max_item_count);
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
