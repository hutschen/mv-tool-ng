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

import { combineLatest, skip, withLatestFrom } from 'rxjs';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
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
