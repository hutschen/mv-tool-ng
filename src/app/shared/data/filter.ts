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
import { OptionValue, Options, isSelectionChanged } from './options';

export class FilterByPattern {
  protected _patternSubject: BehaviorSubject<string>;
  protected _negatedSubject: BehaviorSubject<boolean>;
  readonly queryParams$: Observable<IQueryParams>;
  readonly isSet$: Observable<boolean>;

  constructor(
    public readonly name: string,
    initQueryParams: IQueryParams = {}
  ) {
    const initialState = this.__evalQueryParams(initQueryParams);
    this._patternSubject = new BehaviorSubject<string>(initialState.pattern);
    this._negatedSubject = new BehaviorSubject<boolean>(initialState.negated);

    // Set observables
    this.queryParams$ = combineLatest([
      this._patternSubject,
      this._negatedSubject,
    ]).pipe(
      map(([pattern, negated]) => {
        if (pattern.length) {
          const queryParams: IQueryParams = { [this.name]: pattern };
          if (negated) {
            queryParams[`neg_${this.name}`] = true;
          }
          return queryParams;
        }
        return {};
      })
    );
    this.isSet$ = this._patternSubject.pipe(
      map((pattern) => pattern.length > 0)
    );
  }

  private __evalQueryParams(queryParams: IQueryParams): {
    pattern: string;
    negated: boolean;
  } {
    const negated = queryParams[`neg_${this.name}`] === true;
    const pattern = queryParams[this.name];
    if (isString(pattern)) {
      return { pattern, negated };
    }
    return { pattern: '', negated };
  }

  set pattern(pattern: string) {
    this._patternSubject.next(pattern);
  }

  get pattern(): string {
    return this._patternSubject.value;
  }

  set negated(negated: boolean) {
    this._negatedSubject.next(negated);
  }

  get negated(): boolean {
    return this._negatedSubject.value;
  }

  clear(): void {
    this._patternSubject.next('');
  }
}

export class FilterByValues {
  protected _selectionSubject = new ReplaySubject<OptionValue[]>(1);
  protected _negatedSubject: BehaviorSubject<boolean>;
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

    const initialState = this.__evalQueryParams(initQueryParams);
    this._negatedSubject = new BehaviorSubject<boolean>(initialState.negated);

    // Set initial selection
    this.options
      .getOptions(...initialState.values)
      .pipe(
        takeUntil(this.options.selectionChanged$),
        withLatestFrom(this.options.selection$)
      )
      .subscribe(([initSelection, selection]) => {
        if (isSelectionChanged(initSelection, selection)) {
          // Initial selection changes selection
          this.options.setSelection(...initSelection);
        } else {
          // Trigger queryParams$ and isSet$ when selection is not changed
          this._selectionSubject.next(selection.map((o) => o.value));
        }
      });

    // Define queryParams$ and isSet$ observables
    this.queryParams$ = combineLatest([
      this._selectionSubject,
      this._negatedSubject,
    ]).pipe(
      map(([values, negated]) => {
        if (values.length) {
          const queryParams: IQueryParams = { [this.name]: values };
          if (negated) {
            queryParams[`neg_${this.name}`] = true;
          }
          return queryParams;
        }
        return {};
      })
    );
    this.isSet$ = this._selectionSubject.pipe(
      map((values) => 0 < values.length),
      distinctUntilChanged()
    );
  }

  private __evalQueryParams(queryParams: IQueryParams): {
    values: OptionValue[];
    negated: boolean;
  } {
    // Get initial negation state from query params
    const negated = queryParams[`neg_${this.name}`] === true;

    // Get initial selection from query params
    const rawValue = queryParams[this.name];
    if (rawValue !== undefined) {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      if (values.every((v) => typeof v === this.__queryParamType)) {
        return { values, negated };
      } else if ('string' === this.__queryParamType) {
        return { values: values.map((v) => String(v)), negated };
      }
    }

    return { values: [], negated };
  }

  set negated(negated: boolean) {
    this._negatedSubject.next(negated);
  }

  get negated(): boolean {
    return this._negatedSubject.value;
  }

  clear(): void {
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
