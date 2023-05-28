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

import { combineLatest, Subject, take } from 'rxjs';
import { IQueryParams } from '../services/query-params.service';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
  Filters,
} from './filter';
import { StaticOptions } from './options';

describe('FilterByPattern', () => {
  const name = 'filter_name';
  const initQueryParams = {
    [name]: 'a filter pattern',
  };
  let sut: FilterByPattern;

  beforeEach(() => {
    sut = new FilterByPattern(name, initQueryParams);
  });

  it('should be created', (done: DoneFn) => {
    // Test if initial query params are loaded
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual(initQueryParams);
      done();
    });
  });

  it('should set pattern', (done: DoneFn) => {
    const pattern = 'a new pattern';
    sut.pattern = pattern;
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({ [name]: pattern });
      done();
    });
  });

  it('should get pattern', () => {
    expect(sut.pattern).toEqual(initQueryParams[name]);
  });

  it('should set negated', (done: DoneFn) => {
    sut.negated = true;
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({
        [name]: sut.pattern,
        [`neg_${name}`]: true,
      });
      done();
    });
  });

  it('should get negated', () => {
    expect(sut.negated).toBeFalse();
    sut.negated = true;
    expect(sut.negated).toBeTrue();
  });

  it('should clear pattern', (done: DoneFn) => {
    sut.clear();
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({});
      done();
    });
  });
});

describe('FilterByValues', () => {
  const name = 'filter_name';
  const options = new StaticOptions(
    [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ],
    true
  );
  const initValues = ['a', 'b'];
  const initQueryParams = {
    [name]: initValues,
  };
  let sut: FilterByValues;

  beforeEach(() => {
    sut = new FilterByValues(name, options, initQueryParams, 'string');
  });

  it('should be created', (done: DoneFn) => {
    // Test if initial query params are loaded
    combineLatest([sut.isSet$, sut.queryParams$])
      .pipe(take(1))
      .subscribe(([isSet, queryParams]) => {
        expect(isSet).toBeTrue();
        expect(queryParams).toEqual(initQueryParams);
        done();
      });
  });

  it('should set negated', (done: DoneFn) => {
    sut.negated = true;
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({
        [name]: initValues,
        [`neg_${name}`]: true,
      });
      done();
    });
  });

  it('should get negated', () => {
    expect(sut.negated).toBeFalse();
    sut.negated = true;
    expect(sut.negated).toBeTrue();
  });

  it('should clear selection', (done: DoneFn) => {
    sut.clear();
    combineLatest([sut.isSet$, sut.queryParams$])
      .pipe(take(1))
      .subscribe(([isSet, queryParams]) => {
        expect(isSet).toBeFalse();
        expect(queryParams).toEqual({});
        done();
      });
  });
});

describe('FilterForExistence', () => {
  const name = 'filter_name';
  const initQueryParams = {
    [name]: true,
  };
  let sut: FilterForExistence;

  beforeEach(() => {
    sut = new FilterForExistence(name, initQueryParams);
  });

  it('should be created', (done: DoneFn) => {
    // Test if initial query params are loaded
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual(initQueryParams);
      done();
    });
  });

  it('should set exists', (done: DoneFn) => {
    sut.exists = false;
    combineLatest([sut.exists$, sut.queryParams$])
      .pipe(take(1))
      .subscribe(([exists, queryParams]) => {
        expect(exists).toBe(false);
        expect(queryParams).toEqual({ [name]: false });
        done();
      });
  });

  it('should get exists', () => {
    expect(sut.exists).toBe(true);
  });

  it('should clear exists', (done: DoneFn) => {
    sut.clear();
    combineLatest([sut.exists$, sut.queryParams$])
      .pipe(take(1))
      .subscribe(([exits, queryParams]) => {
        expect(exits).toBeNull();
        expect(queryParams).toEqual({});
        done();
      });
  });
});

describe('Filters', () => {
  const label = 'a label';
  let filterByPattern: any;
  let filterByValues: any;
  let filterForExistence: any;
  let sut: Filters;

  beforeEach(() => {
    filterByPattern = jasmine.createSpyObj('FilterByPattern', ['clear'], {
      queryParams$: new Subject<IQueryParams>(),
      isSet$: new Subject<boolean>(),
    });
    filterByValues = jasmine.createSpyObj('FilterByValues', ['clear'], {
      queryParams$: new Subject<IQueryParams>(),
      isSet$: new Subject<boolean>(),
    });
    filterForExistence = jasmine.createSpyObj('FilterForExistence', ['clear'], {
      queryParams$: new Subject<IQueryParams>(),
      isSet$: new Subject<boolean>(),
    });
    sut = new Filters(
      label,
      filterByPattern,
      filterByValues,
      filterForExistence
    );
  });

  it('should indicate that it holds filters', () => {
    expect(sut.valueOf()).toBeTruthy();
    expect(sut.hasFilters).toBeTrue();
  });

  it('should indicate that it does not hold filters', () => {
    sut = new Filters(label);
    expect(sut.valueOf()).toBeFalsy();
    expect(sut.hasFilters).toBeFalse();
  });

  it('should combine query params', (done: DoneFn) => {
    const queryParams = {
      by_pattern: 'a',
      by_values: ['a', 'b'],
      for_existence: true,
    };
    sut.queryParams$.pipe(take(1)).subscribe((params) => {
      expect(params).toEqual(queryParams);
      done();
    });
    filterByPattern.queryParams$.next({ by_pattern: 'a' });
    filterByValues.queryParams$.next({ by_values: ['a', 'b'] });
    filterForExistence.queryParams$.next({ for_existence: true });
  });

  it('should indicate if at least one filter is set', (done: DoneFn) => {
    sut.isSet$.pipe(take(1)).subscribe((isSet) => {
      expect(isSet).toBeTrue();
      done();
    });
    filterByPattern.isSet$.next(true);
    filterByValues.isSet$.next(false);
    filterForExistence.isSet$.next(false);
  });

  it('should indicate if no filters are set', (done: DoneFn) => {
    sut.isSet$.pipe(take(1)).subscribe((isSet) => {
      expect(isSet).toBeFalse();
      done();
    });
    filterByPattern.isSet$.next(false);
    filterByValues.isSet$.next(false);
    filterForExistence.isSet$.next(false);
  });

  it('should clear all filters', () => {
    sut.clear();
    expect(filterByPattern.clear).toHaveBeenCalled();
    expect(filterByValues.clear).toHaveBeenCalled();
    expect(filterForExistence.clear).toHaveBeenCalled();
  });
});
