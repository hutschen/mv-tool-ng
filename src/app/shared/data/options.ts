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
import { Observable, map, of, startWith } from 'rxjs';

export type OptionValue = string | number;

export interface IOption {
  label: string;
  value: OptionValue;
}

export function toOptionValues(raw: unknown): OptionValue[] {
  if (
    Array.isArray(raw) &&
    (raw.every((v) => typeof v === 'string') ||
      raw.every((v) => typeof v === 'number'))
  ) {
    return raw;
  } else if (typeof raw === 'string' || typeof raw === 'number') {
    return [raw];
  } else {
    return [];
  }
}

export function fromOptionValues(
  values: OptionValue[],
  multiple: boolean = true
): null | OptionValue | OptionValue[] {
  if (multiple) {
    return values;
  } else {
    return values.length > 0 ? values[0] : null;
  }
}

export function areSelectedValuesChanged(
  previous: OptionValue[],
  current: OptionValue[]
): boolean {
  return !(
    previous.length == current.length &&
    previous.every(Set.prototype.has, new Set(current))
  );
}

export function isSelectionChanged(
  prevSelection: IOption[],
  currSelection: IOption[]
): boolean {
  if (prevSelection.length !== currSelection.length) {
    return true;
  }

  return areSelectedValuesChanged(
    prevSelection.map((o) => o.value),
    currSelection.map((o) => o.value)
  );
}

export abstract class Options {
  private __selection: SelectionModel<IOption>;
  readonly selectionChanged$: Observable<IOption[]>;
  readonly selection$: Observable<IOption[]>;
  abstract readonly hasToLoad: boolean;

  constructor(multiple: boolean = true) {
    // Define the selection model
    this.__selection = new SelectionModel(
      multiple,
      undefined,
      undefined,
      (o1: IOption, o2: IOption) => o1.value === o2.value
    );

    // Define the selectionChanged$ observable
    this.selectionChanged$ = this.__selection.changed.pipe(
      map((e) => e.source.selected)
    );

    // Define the selection$ observable
    this.selection$ = this.selectionChanged$.pipe(
      startWith(null),
      map((options) => (options === null ? this.__selection.selected : options))
    );
  }

  get isMultipleSelection() {
    return this.__selection.isMultipleSelection();
  }

  get selection(): IOption[] {
    return this.__selection.selected;
  }

  abstract getOptions(...values: OptionValue[]): Observable<IOption[]>;

  abstract filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]>;

  getAllOptions(): Observable<IOption[]> {
    return this.filterOptions();
  }

  selectOptions(...options: IOption[]) {
    return this.__selection.select(...options);
  }

  deselectOptions(...options: IOption[]) {
    return this.__selection.deselect(...options);
  }

  toggleOption(option: IOption) {
    return this.__selection.toggle(option);
  }

  setSelection(...options: IOption[]) {
    return this.__selection.setSelection(...options);
  }

  isSelected(option: IOption) {
    return this.__selection.isSelected(option);
  }

  clearSelection() {
    return this.__selection.clear();
  }
}

export class StaticOptions extends Options {
  readonly hasToLoad = false;

  constructor(readonly options: IOption[], multiple: boolean = true) {
    super(multiple);
  }

  getOptions(...values: OptionValue[]): Observable<IOption[]> {
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
  constructor(values: string[], multiple: boolean = true) {
    super(
      values.map((v) => ({ label: title(v), value: v })),
      multiple
    );
  }
}
