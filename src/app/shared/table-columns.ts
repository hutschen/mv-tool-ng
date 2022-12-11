// Copyright (C) 2022 Helmar Hutschenreuter
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

export interface ITableColumn<T extends object> {
  id: string;
  optional?: boolean;
  label?: string;
  auto?: boolean;
  filterable?: boolean;
  filters?: string[];
  toValue?: (data: T) => any;
  toStr?: (data: T) => string;
  toBool?: (data: T) => boolean;
}

export class TableColumn<T extends object> implements ITableColumn<T> {
  id: string;
  optional: boolean;
  label: string;
  auto: boolean;
  filterable: boolean;
  filters: string[];
  protected _toValue?: (data: T) => any;
  protected _toStr?: (data: T) => string;
  protected _toBool?: (data: T) => boolean;

  constructor(tableColumn: ITableColumn<T>) {
    this.id = tableColumn.id;
    this.optional = tableColumn.optional ?? false;
    this.label = tableColumn.label ?? this.id;
    this.auto = tableColumn.auto ?? false;
    this.filterable = tableColumn.filterable ?? true;
    this.filters = tableColumn.filters ?? [];
    this._toValue = tableColumn.toValue;
    this._toStr = tableColumn.toStr;
    this._toBool = tableColumn.toBool;
  }

  filter(data: T): boolean {
    if (!this.filterable) {
      return true;
    }
    if (this.filters.length === 0) {
      return true;
    }
    return this.filters.includes(this.toStr(data));
  }

  get filtered(): boolean {
    return this.filterable && this.filters.length > 0;
  }

  toValue(data: T): any {
    if (this._toValue) {
      return this._toValue(data);
    } else {
      return this.id in data ? data[this.id as keyof T] : null;
    }
  }

  toStr(data: T): string {
    return this._toStr ? this._toStr(data) : String(this.toValue(data) ?? '');
  }

  toBool(data: T): boolean {
    return this._toBool ? this._toBool(data) : !!this.toValue(data);
  }
}

export class TableColumns<T extends object> {
  protected _columns: TableColumn<T>[] = [];
  protected _columnMap: Map<string, TableColumn<T>>;

  constructor(columns: ITableColumn<T>[]) {
    this._columns = columns.map((c) => new TableColumn(c));
    this._columnMap = new Map(this._columns.map((c) => [c.id, c]));
  }

  filter(data: T[]): T[] {
    return data.filter((d) => this._columns.every((c) => c.filter(d)));
  }

  toRowData(data: T[]): any[] {
    return data.map((d) => {
      const row: any = {};
      this._columns.forEach((c) => (row[c.id] = c.toStr(d)));
      row['data'] = d;
      return row;
    });
  }

  getColumn(id: string): TableColumn<T> {
    const column = this._columnMap.get(id);
    if (!column) {
      throw new Error(`Column "${id}" not found`);
    }
    return column;
  }

  columnsToShow(data: T[] = []): TableColumn<T>[] {
    return this._columns.filter(
      (c) => !c.optional || data.some((d) => c.toBool(d))
    );
  }

  columnsToAutoCreate(): TableColumn<T>[] {
    return this._columns.filter((c) => c.auto);
  }
}
