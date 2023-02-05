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
  distinctUntilChanged,
  map,
  Observable,
  of,
} from 'rxjs';
import { IQueryParams } from './services/crud.service';

export class FilterByPattern {
  protected _patternSubject = new BehaviorSubject<string>('');
  readonly pattern$: Observable<string> = this._patternSubject.asObservable();
  readonly queryParams$: Observable<IQueryParams> = this.pattern$.pipe(
    map((pattern) => (pattern.length > 0 ? { [this.name]: pattern } : {}))
  );
  readonly isSet$: Observable<boolean> = this.pattern$.pipe(
    map((pattern) => pattern.length > 0)
  );

  constructor(public readonly name: string) {}

  set queryParams(queryParams: IQueryParams) {
    const raw = queryParams[this.name] as string | string[] | undefined;
    if (raw) {
      this.pattern = Array.isArray(raw) ? raw[0] : raw;
    }
  }

  set pattern(pattern: string) {
    this._patternSubject.next(pattern);
  }

  get pattern(): string {
    return this._patternSubject.value;
  }

  clear(): void {
    this._patternSubject.next('');
  }
}

export interface IFilterOption {
  label: string;
  value: string | number;
}

export class FilterByValues {
  readonly hasToLoadOptions: boolean = false;
  protected _selectionSubject = new BehaviorSubject<IFilterOption[]>([]);
  readonly selection$: Observable<IFilterOption[]> =
    this._selectionSubject.asObservable();
  readonly queryParams$: Observable<IQueryParams> = this.selection$.pipe(
    map((selection) =>
      selection.length > 0 ? { [this.name]: selection.map((o) => o.value) } : {}
    )
  );
  readonly isSet$: Observable<boolean> = this.selection$.pipe(
    map((selection) => selection.length > 0)
  );

  constructor(
    public readonly name: string,
    private __options?: IFilterOption[]
  ) {}

  set queryParams(queryParams: IQueryParams) {
    const raw = queryParams[this.name] as string | string[] | undefined;
    if (raw) {
      const strings: string[] = Array.isArray(raw) ? raw : [raw];
      if (strings.every((s) => /^\d+$/.test(s))) {
        this.values = strings.map((s) => parseInt(s));
      } else {
        this.values = strings;
      }
    }
  }

  set values(values: (string | number)[]) {
    this.getOptionsByValues(values).subscribe((options) => {
      this._selectionSubject.next(options);
    });
  }

  selectOption(option: IFilterOption): void {
    const selection = this._selectionSubject.value;
    if (!selection.some((o) => o.value === option.value)) {
      selection.push(option);
      this._selectionSubject.next(selection);
    }
  }

  deselectOption(option: IFilterOption): void {
    const selection = this._selectionSubject.value;
    const index = selection.findIndex((o) => o.value === option.value);
    if (index >= 0) {
      selection.splice(index, 1);
      this._selectionSubject.next(selection);
    }
  }

  getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    if (this.__options) {
      if (searchStr) {
        return of(
          this.__options.filter((option) =>
            option.label.toLowerCase().includes(searchStr.toLowerCase())
          )
        );
      } else return of(this.__options);
    } else throw new Error('No selectable options defined');
  }

  getOptionsByValues(values: (string | number)[]): Observable<IFilterOption[]> {
    if (this.__options) {
      return of(
        this.__options.filter((option) => values.includes(option.value))
      );
    } else throw new Error('No selectable options defined');
  }

  clear(): void {
    this._selectionSubject.next([]);
  }
}

export class FilterForExistence {
  protected _existsSubject = new BehaviorSubject<boolean | null>(null);
  readonly exists$: Observable<boolean | null> =
    this._existsSubject.asObservable();
  readonly queryParams$: Observable<IQueryParams> = this.exists$.pipe(
    map((exists) => (exists !== null ? { [this.name]: exists } : {}))
  );
  readonly isSet$: Observable<boolean> = this.exists$.pipe(
    map((exists) => exists !== null)
  );

  constructor(public readonly name: string) {}

  set queryParams(queryParams: IQueryParams) {
    switch (queryParams[this.name] as unknown) {
      case 'true':
        this.exists = true;
        break;
      case 'false':
        this.exists = false;
        break;
      default:
        this.exists = null;
        break;
    }
  }

  set exists(exists: boolean | null) {
    this._existsSubject.next(exists);
  }

  get exists(): boolean | null {
    return this._existsSubject.value;
  }

  clear(): void {
    this._existsSubject.next(null);
  }
}

export class Filters {
  readonly queryParams$: Observable<IQueryParams>;
  readonly isSet$: Observable<boolean>;
  readonly hasFilters: boolean;

  constructor(
    public readonly label: string,
    public readonly filterByPattern?: FilterByPattern,
    public readonly filterByValues?: FilterByValues,
    public readonly filterForExistence?: FilterForExistence
  ) {
    this.queryParams$ = combineLatest([
      this.filterByPattern?.queryParams$ ?? of({}),
      this.filterByValues?.queryParams$ ?? of({}),
      this.filterForExistence?.queryParams$ ?? of({}),
    ]).pipe(
      distinctUntilChanged(isEqual),
      map(([patternQueryParams, valuesQueryParams, existsQueryParams]) => ({
        ...patternQueryParams,
        ...valuesQueryParams,
        ...existsQueryParams,
      }))
    );

    this.isSet$ = combineLatest([
      this.filterByPattern?.isSet$ ?? of(false),
      this.filterByValues?.isSet$ ?? of(false),
      this.filterForExistence?.isSet$ ?? of(false),
    ]).pipe(
      map((isSetFlags) => isSetFlags.some((isSet) => isSet)),
      distinctUntilChanged((a, b) => a === b)
    );

    this.hasFilters = Boolean(
      this.filterByPattern || this.filterByValues || this.filterForExistence
    );
  }

  set queryParams(queryParams: IQueryParams) {
    if (this.filterByPattern) this.filterByPattern.queryParams = queryParams;
    if (this.filterByValues) this.filterByValues.queryParams = queryParams;
    if (this.filterForExistence)
      this.filterForExistence.queryParams = queryParams;
  }

  valueOf() {
    return this.hasFilters;
  }

  clear(): void {
    this.filterByPattern?.clear();
    this.filterByValues?.clear();
    this.filterForExistence?.clear();
  }
}
