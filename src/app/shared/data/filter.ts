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

import { isEqual, isString } from 'radash';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  ReplaySubject,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import { IQueryParams } from '../services/query-params.service';
import { OptionValue, Options } from './options';

export class FilterByPattern {
  protected _patternSubject: BehaviorSubject<string>;
  readonly pattern$: Observable<string>;
  readonly queryParams$: Observable<IQueryParams>;
  readonly isSet$: Observable<boolean>;

  constructor(
    public readonly name: string,
    initQueryParams: IQueryParams = {}
  ) {
    // Get initial pattern
    this._patternSubject = new BehaviorSubject<string>(
      this.__evalQueryParams(initQueryParams)
    );

    // Set observables
    this.pattern$ = this._patternSubject.asObservable();
    this.queryParams$ = this.pattern$.pipe(
      map((pattern) => (pattern.length > 0 ? { [this.name]: pattern } : {}))
    );
    this.isSet$ = this.pattern$.pipe(map((pattern) => pattern.length > 0));
  }

  private __evalQueryParams(queryParams: IQueryParams): string {
    const pattern = queryParams[this.name];
    if (isString(pattern)) {
      return pattern;
    }
    return '';
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
  protected _selectionSubject = new ReplaySubject<OptionValue[]>(1);
  readonly queryParams$: Observable<IQueryParams>;
  readonly isSet$: Observable<boolean>;

  constructor(
    readonly name: string,
    readonly options: Options,
    initQueryParams: IQueryParams = {},
    private __queryParamType: 'string' | 'number' = 'number'
  ) {
    // Update seleted values when selection changes
    this.options.selectionChanged$
      .pipe(map((options) => options.map((o) => o.value)))
      .subscribe((values) => this._selectionSubject.next(values));

    // Set initial selection
    this.options
      .getOptions(...this.__evalQueryParams(initQueryParams))
      .pipe(
        takeUntil(this.options.selectionChanged$),
        withLatestFrom(this.options.selection$)
      )
      .subscribe(([initSelection, selection]) => {
        if (!isEqual(initSelection, selection)) {
          // Initial selection changes selection
          this.options.setSelection(...initSelection);
        } else {
          // Trigger queryParams$ and isSet$ when selection is not changed
          this._selectionSubject.next(selection.map((o) => o.value));
        }
      });

    // Define queryParams$ and isSet$ observables
    this.queryParams$ = this._selectionSubject.pipe(
      map((values) => (values.length > 0 ? { [this.name]: values } : {}))
    );
    this.isSet$ = this._selectionSubject.pipe(
      map((values) => values.length > 0),
      distinctUntilChanged()
    );
  }

  private __evalQueryParams(queryParams: IQueryParams): OptionValue[] {
    const rawValue = queryParams[this.name];
    if (rawValue !== undefined) {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      if (values.every((v) => typeof v === this.__queryParamType)) {
        return values;
      } else if ('string' === this.__queryParamType) {
        return values.map((v) => String(v));
      }
    }
    return [];
  }

  clear(): void {
    console.log('clear');
    this.options.clearSelection();
  }
}

export class FilterForExistence {
  protected _existsSubject: BehaviorSubject<boolean | null>;
  readonly exists$: Observable<boolean | null>;
  readonly queryParams$: Observable<IQueryParams>;
  readonly isSet$: Observable<boolean>;

  constructor(
    public readonly name: string,
    initQueryParams: IQueryParams = {}
  ) {
    // Get initial value from query params
    this._existsSubject = new BehaviorSubject<boolean | null>(
      this.__evalQueryParams(initQueryParams)
    );

    // Set observables
    this.exists$ = this._existsSubject.asObservable();
    this.queryParams$ = this.exists$.pipe(
      map((exists) => (exists !== null ? { [this.name]: exists } : {}))
    );
    this.isSet$ = this.exists$.pipe(map((exists) => exists !== null));
  }

  private __evalQueryParams(queryParams: IQueryParams): boolean | null {
    const exists = queryParams[this.name];
    if (typeof exists === 'boolean') return exists;
    else return null;
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

  valueOf() {
    return this.hasFilters;
  }

  clear(): void {
    this.filterByPattern?.clear();
    this.filterByValues?.clear();
    this.filterForExistence?.clear();
  }
}
