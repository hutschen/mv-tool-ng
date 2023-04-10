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

import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { IQueryParams } from './services/query-params.service';

/**
 * Combines a list of query parameters observables into a single observable.
 *
 * The resulting observable combines the latest values from each input
 * observable and is also shared and replayed, ensuring new subscribers will
 * always receive the most recent combined value.
 *
 * @param observables - An array of observables that emit IQueryParams objects.
 * @returns An observable that emits a single IQueryParams object with combined
 * values.
 */
export function combineQueryParams(
  observables: Observable<IQueryParams>[]
): Observable<IQueryParams> {
  return combineLatest(observables).pipe(
    map((queryParamsList) =>
      queryParamsList.reduce(
        (combinedParams, currentParams) => ({
          ...combinedParams,
          ...currentParams,
        }),
        {}
      )
    ),
    shareReplay(1)
  );
}
