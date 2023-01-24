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

export class DataField<D extends object, V> {
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

export class PlaceholderField<D extends object> extends DataField<D, any> {
  constructor(name: string, label: string | null = null) {
    super(name, label, false);
  }

  override toValue(data: D): any {
    return null;
  }
}

export class DataColumn<D extends object> {
  constructor(
    public dataField: DataField<D, any>,
    public hide: boolean = false
  ) {}

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

export class PlaceholderColumn<D extends object> extends DataColumn<D> {
  constructor(
    name: string,
    label: string | null = null,
    hide: boolean = false
  ) {
    super(new PlaceholderField(name, label), hide);
  }
}

export class DataFrame<D extends object> {
  constructor(public columns: DataColumn<D>[], public data: D[] = []) {}

  getColumn(name: string): DataColumn<D> {
    const column = this.columns.find((column) => column.name === name);
    if (column) {
      return column;
    } else throw new Error(`Column ${name} not found`);
  }

  get shownColumns(): DataColumn<D>[] {
    return this.columns.filter((column) => column.isShown(this.data));
  }
}
