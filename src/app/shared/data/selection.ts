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

import { SelectionModel } from '@angular/cdk/collections';
import { IDataItem } from './data';
import { Observable, map, startWith } from 'rxjs';
import { IQueryParams } from '../services/query-params.service';

export class DataSelection<T extends IDataItem> {
  private __selection: SelectionModel<T['id']>;
  readonly selectionChanged$: Observable<T['id'][]>;
  readonly selection$: Observable<T['id'][]>;
  readonly queryParams$: Observable<IQueryParams>;

  constructor(
    public readonly name: string,
    multiple: boolean = false,
    initQueryParams: IQueryParams = {},
    public readonly idType: 'number' | 'string' = 'number'
  ) {
    // Define the selection model
    this.__selection = new SelectionModel(
      multiple,
      this.__evalQueryParams(initQueryParams)
    );

    // Define the selectionChanged$ observable
    this.selectionChanged$ = this.__selection.changed.pipe(
      map((e) => e.source.selected)
    );

    // Define the selection$ observable
    this.selection$ = this.selectionChanged$.pipe(startWith(this.selected));

    // Define the queryParams$ observable
    this.queryParams$ = this.selection$.pipe(
      map((selected) => (selected.length > 0 ? { [this.name]: selected } : {}))
    );
  }

  private __evalQueryParams(queryParams: IQueryParams): T['id'][] {
    const value = queryParams[this.name];
    if (value !== undefined) {
      const ids = Array.isArray(value) ? value : [value];
      if (ids.every((id) => typeof id === this.idType)) {
        return ids;
      } else if ('string' === this.idType) {
        return ids.map((id) => String(id));
      }
    }
    return [];
  }

  select(...values: T[]): boolean | void {
    const ids = values.map((v) => v.id);
    return this.__selection.select(...ids);
  }

  deselect(...values: T[]): boolean | void {
    const ids = values.map((v) => v.id);
    return this.__selection.deselect(...ids);
  }

  toggle(value: T): boolean | void {
    return this.__selection.toggle(value.id);
  }

  isSelected(value: T): boolean {
    return this.__selection.isSelected(value.id);
  }

  get selected(): T['id'][] {
    return this.__selection.selected;
  }

  clear(): void {
    this.__selection.clear();
  }
}
