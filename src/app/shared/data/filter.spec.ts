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

import { BehaviorSubject, combineLatest, skip, withLatestFrom } from 'rxjs';
import { IQueryParams } from '../services/query-params.service';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
  Filters,
  IFilterOption,
} from './filter';

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
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual(initQueryParams);
      done();
    });
  });

  it('should set pattern', (done: DoneFn) => {
    const pattern = 'a new pattern';
    sut.pattern = pattern;
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({ [name]: pattern });
      done();
    });
  });

  it('should get pattern', () => {
    expect(sut.pattern).toEqual(initQueryParams[name]);
  });

  it('should clear pattern', (done: DoneFn) => {
    sut.clear();
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({});
      done();
    });
  });
});

describe('FilterByValues', () => {
  const name = 'filter_name';
  const options: IFilterOption[] = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
    { value: 'c', label: 'C' },
  ];
  const initValues = ['a', 'b'];
  const initQueryParams = {
    [name]: initValues,
  };
  let sut: FilterByValues;

  beforeEach(() => {
    sut = new FilterByValues(name, options, initQueryParams);
  });

  it('should be created', (done: DoneFn) => {
    // Test if initial query params are loaded
    combineLatest([sut.isSet$, sut.queryParams$]).subscribe(
      ([isSet, queryParams]) => {
        expect(isSet).toBeTrue();
        expect(queryParams).toEqual(initQueryParams);
        done();
      }
    );
  });

  it('should ignore select of selected option', (done: DoneFn) => {
    sut.selectOption(options[0]); // select 'a'
    combineLatest([sut.selection$, sut.isSet$, sut.queryParams$]).subscribe(
      ([selection, isSet, queryParams]) => {
        // check if selection is unchanged
        expect(selection).toEqual(
          options.filter((o) => initValues.includes(o.value as string))
        );
        expect(isSet).toBeTrue();
        expect(queryParams).toEqual(initQueryParams);
        done();
      }
    );
  });

  it('should select unselected option', (done: DoneFn) => {
    sut.selectOption(options[2]); // select 'c'
    sut.selection$
      .pipe(
        skip(1), // selectOption waits internally for emission of selection$
        withLatestFrom(sut.isSet$, sut.queryParams$)
      )
      .subscribe(([selection, isSet, queryParams]) => {
        // check if selection is updated
        expect(selection).toEqual(options);
        expect(isSet).toBeTrue();
        expect(queryParams).toEqual({ [name]: options.map((o) => o.value) });
        done();
      });
  });

  it('should deselect selected option', (done: DoneFn) => {
    sut.deselectOption(options[1]); // deselect 'b'
    sut.selection$
      .pipe(
        skip(1), // deselectOptions waits internally for emission of selection$
        withLatestFrom(sut.isSet$, sut.queryParams$)
      )
      .subscribe(([selection, isSet, queryParams]) => {
        // check if selection is updated
        expect(selection).toEqual([options[0]]);
        expect(isSet).toBeTrue();
        expect(queryParams).toEqual({ [name]: [options[0].value] });
        done();
      });
  });

  it('should ignore deselect of unselected option', (done: DoneFn) => {
    sut.deselectOption(options[2]); // deselect 'c'
    combineLatest([sut.selection$, sut.isSet$, sut.queryParams$]).subscribe(
      ([selection, isSet, queryParams]) => {
        // check if selection is unchanged
        expect(selection).toEqual(
          options.filter((o) => initValues.includes(o.value as string))
        );
        expect(isSet).toBeTrue();
        expect(queryParams).toEqual(initQueryParams);
        done();
      }
    );
  });

  it('should clear selection', (done: DoneFn) => {
    sut.clear();
    combineLatest([sut.selection$, sut.isSet$, sut.queryParams$]).subscribe(
      ([selection, isSet, queryParams]) => {
        expect(selection).toEqual([]);
        expect(isSet).toBeFalse();
        expect(queryParams).toEqual({});
        done();
      }
    );
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
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual(initQueryParams);
      done();
    });
  });

  it('should set exists', (done: DoneFn) => {
    sut.exists = false;
    combineLatest([sut.exists$, sut.queryParams$]).subscribe(
      ([exists, queryParams]) => {
        expect(exists).toBe(false);
        expect(queryParams).toEqual({ [name]: false });
        done();
      }
    );
  });

  it('should get exists', () => {
    expect(sut.exists).toBe(true);
  });

  it('should clear exists', (done: DoneFn) => {
    sut.clear();
    combineLatest([sut.exists$, sut.queryParams$]).subscribe(
      ([exits, queryParams]) => {
        expect(exits).toBeNull();
        expect(queryParams).toEqual({});
        done();
      }
    );
  });
});

class DummyFilter {
  queryParamsSubject = new BehaviorSubject<IQueryParams>({});
  queryParams$ = this.queryParamsSubject.asObservable();
  isSetSubject = new BehaviorSubject<boolean>(false);
  isSet$ = this.isSetSubject.asObservable();

  clear(): void {
    this.queryParamsSubject.next({});
    this.isSetSubject.next(false);
  }
}

describe('Filters', () => {
  const label = 'a label';
  let filterByPattern: DummyFilter;
  let filterByValues: DummyFilter;
  let filterForExistence: DummyFilter;
  let sut: Filters;

  beforeEach(() => {
    filterByPattern = new DummyFilter();
    filterByValues = new DummyFilter();
    filterForExistence = new DummyFilter();
    sut = new Filters(
      label,
      filterByPattern as unknown as FilterByPattern,
      filterByValues as unknown as FilterByValues,
      filterForExistence as unknown as FilterForExistence
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
    filterByPattern.queryParamsSubject.next({ by_pattern: 'a' });
    filterByValues.queryParamsSubject.next({ by_values: ['a', 'b'] });
    filterForExistence.queryParamsSubject.next({ for_existence: true });
    sut.queryParams$.subscribe((params) => {
      expect(params).toEqual(queryParams);
      done();
    });
  });

  it('should indicate if at least one filter is set', (done: DoneFn) => {
    filterByPattern.isSetSubject.next(true);
    filterByValues.isSetSubject.next(false);
    filterForExistence.isSetSubject.next(false);
    sut.isSet$.subscribe((isSet) => {
      expect(isSet).toBeTrue();
      done();
    });
  });

  it('should indicate if no filters are set', (done: DoneFn) => {
    filterByPattern.isSetSubject.next(false);
    filterByValues.isSetSubject.next(false);
    filterForExistence.isSetSubject.next(false);
    sut.isSet$.subscribe((isSet) => {
      expect(isSet).toBeFalse();
      done();
    });
  });

  it('should clear all filters', (done: DoneFn) => {
    filterByPattern.isSetSubject.next(true);
    filterByValues.isSetSubject.next(true);
    filterForExistence.isSetSubject.next(true);
    sut.clear();
    combineLatest([
      filterByPattern.isSet$,
      filterByValues.isSet$,
      filterForExistence.isSet$,
    ]).subscribe(([isSet1, isSet2, isSet3]) => {
      expect(isSet1).toBeFalse();
      expect(isSet2).toBeFalse();
      expect(isSet3).toBeFalse();
      done();
    });
  });
});
