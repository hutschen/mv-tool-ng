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

import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { IQueryParams } from './services/query-params.service';
import { combineQueryParams } from './combine-query-params';

describe('combineQueryParams', () => {
  it('should combine query params from multiple observables', (done) => {
    const searchQueryParams: IQueryParams = { search: 'test' };
    const filterQueryParams: IQueryParams = { filter: 'category', value: 1 };
    const sortQueryParams: IQueryParams = { sort: 'asc' };

    const combined$ = combineQueryParams([
      of(searchQueryParams),
      of(filterQueryParams),
      of(sortQueryParams),
    ]);

    combined$.pipe(take(1)).subscribe((combinedParams) => {
      expect(combinedParams).toEqual({
        search: 'test',
        filter: 'category',
        value: 1,
        sort: 'asc',
      });
      done();
    });
  });

  it('should handle empty query params', (done) => {
    const searchQueryParams: IQueryParams = {};
    const filterQueryParams: IQueryParams = { filter: 'category', value: 1 };
    const sortQueryParams: IQueryParams = {};

    const combined$ = combineQueryParams([
      of(searchQueryParams),
      of(filterQueryParams),
      of(sortQueryParams),
    ]);

    combined$.pipe(take(1)).subscribe((combinedParams) => {
      expect(combinedParams).toEqual({
        filter: 'category',
        value: 1,
      });
      done();
    });
  });

  it('should handle overlapping keys', (done) => {
    const searchQueryParams: IQueryParams = { sharedKey: 'search' };
    const filterQueryParams: IQueryParams = { sharedKey: 'filter' };
    const sortQueryParams: IQueryParams = { sharedKey: 'sort' };

    const combined$ = combineQueryParams([
      of(searchQueryParams),
      of(filterQueryParams),
      of(sortQueryParams),
    ]);

    combined$.pipe(take(1)).subscribe((combinedParams) => {
      expect(combinedParams).toEqual({
        sharedKey: 'sort',
      });
      done();
    });
  });
});
