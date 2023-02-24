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

import { combineLatest } from 'rxjs';
import { ISort, Sorting } from './sort';

describe('Sorting', () => {
  const initQueryParams = {
    sort_by: 'title',
    sort_order: 'asc',
  };
  let sut: Sorting;

  beforeEach(() => {
    sut = new Sorting(initQueryParams);
  });

  it('should be created', (done: DoneFn) => {
    // Test if initial query params are loaded
    combineLatest([
      sut.active$,
      sut.direction$,
      sut.isSorted$,
      sut.queryParams$,
    ])
      .subscribe(([active, direction, isSorted, queryParams]) => {
        expect(active).toEqual(initQueryParams.sort_by);
        expect(direction).toEqual(initQueryParams.sort_order);
        expect(isSorted).toBeTrue();
        expect(queryParams).toEqual(initQueryParams);
        done();
      })
      .unsubscribe();
  });

  it('should not load invalid query params', (done: DoneFn) => {
    const invalidQueryParams = {
      sort_by: 'title',
      sort_order: 'invalid',
    };
    sut = new Sorting(invalidQueryParams);
    combineLatest([
      sut.active$,
      sut.direction$,
      sut.isSorted$,
      sut.queryParams$,
    ])
      .subscribe(([active, direction, isSorted, queryParams]) => {
        expect(active).toEqual('');
        expect(direction).toEqual('');
        expect(isSorted).toBeFalse();
        expect(queryParams).toEqual({});
        done();
      })
      .unsubscribe();
  });

  it('should set sort', (done: DoneFn) => {
    const sort: ISort = {
      active: 'other',
      direction: 'desc',
    };
    sut.setSort(sort);
    combineLatest([
      sut.active$,
      sut.direction$,
      sut.isSorted$,
      sut.queryParams$,
    ])
      .subscribe(([active, direction, isSorted, queryParams]) => {
        expect(active).toEqual(sort.active);
        expect(direction).toEqual(sort.direction);
        expect(isSorted).toBeTrue();
        expect(queryParams).toEqual({
          sort_by: sort.active,
          sort_order: sort.direction,
        });
        done();
      })
      .unsubscribe();
  });

  it('should clear sort', (done: DoneFn) => {
    sut.clearSort();
    combineLatest([
      sut.active$,
      sut.direction$,
      sut.isSorted$,
      sut.queryParams$,
    ])
      .subscribe(([active, direction, isSorted, queryParams]) => {
        expect(active).toEqual('');
        expect(direction).toEqual('');
        expect(isSorted).toBeFalse();
        expect(queryParams).toEqual({});
        done();
      })
      .unsubscribe();
  });
});
