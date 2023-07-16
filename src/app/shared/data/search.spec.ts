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

import { take } from 'rxjs';
import { Search } from './search';

describe('Search', () => {
  const initQueryParams = {
    search: 'a search pattern',
  };
  let sut: Search;

  beforeEach(() => {
    sut = new Search(initQueryParams);
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
      expect(queryParams).toEqual({ search: pattern });
      done();
    });
  });

  it('should get pattern', () => {
    expect(sut.pattern).toEqual(initQueryParams.search);
  });

  it('should clear pattern', (done: DoneFn) => {
    sut.clear();
    sut.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({});
      done();
    });
  });

  it('should indicate that pattern is set', (done: DoneFn) => {
    const pattern = 'a new pattern';
    sut.pattern = pattern;
    sut.isSet$.pipe(take(1)).subscribe((isSet) => {
      expect(isSet).toBeTrue();
      done();
    });
  });

  it('should indicate that pattern is not set', (done: DoneFn) => {
    sut.clear();
    sut.isSet$.pipe(take(1)).subscribe((isSet) => {
      expect(isSet).toBeFalse();
      done();
    });
  });
});
