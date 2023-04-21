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
import { title } from 'radash';
import {
  Observable,
  ReplaySubject,
  first,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';

export interface IOption {
  label: string;
  value: string | number;
}

export abstract class Options {
  private __loadSubject = new ReplaySubject<void>(1);
  private __selection: SelectionModel<IOption>;
  readonly selected$: Observable<IOption[]>;
  abstract readonly hasToLoad: boolean;

  constructor(multiple: boolean = true, initValues: (string | number)[] = []) {
    // Define the selection model
    this.__selection = new SelectionModel(
      multiple,
      undefined,
      undefined,
      (o1: IOption, o2: IOption) => o1.value === o2.value
    );

    // Define the selected$ options observable
    this.selected$ = this.__loadSubject.pipe(
      first(),
      switchMap(() => this.getOptions(...initValues)),
      switchMap((options) => {
        this.__selection.clear();
        this.__selection.select(...options);
        return this.__selection.changed.pipe(
          map((e) => e.source.selected),
          startWith(options)
        );
      }),
      shareReplay(1)
    );
  }

  get isMultipleSelection() {
    return this.__selection.isMultipleSelection();
  }

  abstract getOptions(...values: (string | number)[]): Observable<IOption[]>;

  abstract filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]>;

  selectOptions(...options: IOption[]) {
    return this.__selection.select(...options);
  }

  deselectOptions(...options: IOption[]) {
    return this.__selection.deselect(...options);
  }

  clearSelection() {
    return this.__selection.clear();
  }

  loadOptions(): void {
    this.__loadSubject.next();
  }
}

export class StaticOptions extends Options {
  readonly hasToLoad = false;

  constructor(
    readonly options: IOption[],
    multiple: boolean = true,
    initValues: (string | number)[] = []
  ) {
    super(multiple, initValues);
    this.loadOptions();
  }

  getOptions(...values: (string | number)[]): Observable<IOption[]> {
    const valueSet = new Set(values);
    return of(this.options.filter((o) => valueSet.has(o.value)));
  }

  filterOptions(filter?: string, limit?: number): Observable<IOption[]> {
    return of(
      this.options
        .filter(
          (o) => !filter || o.label.toLowerCase().includes(filter.toLowerCase())
        )
        .slice(0, limit ?? this.options.length)
    );
  }
}

export class StringOptions extends StaticOptions {
  constructor(
    values: string[],
    multiple: boolean = true,
    initValues: string[] = []
  ) {
    super(
      values.map((v) => ({ label: title(v), value: v })),
      multiple,
      initValues
    );
  }
}
