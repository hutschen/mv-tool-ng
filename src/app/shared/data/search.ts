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

import { isString } from 'radash';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { IQueryParams } from '../services/query-params.service';

export class Search {
  protected _patternSubject: BehaviorSubject<string>;
  readonly queryParams$: Observable<IQueryParams>;
  readonly isSet$: Observable<boolean>;

  constructor(initQueryParams: IQueryParams = {}) {
    // Get initial pattern
    this._patternSubject = new BehaviorSubject<string>(
      this.__evalQueryParams(initQueryParams)
    );

    // Set queryParams$ observable
    this.queryParams$ = this._patternSubject.asObservable().pipe(
      distinctUntilChanged(),
      map((pattern) =>
        pattern.length > 0 ? { search: pattern } : ({} as IQueryParams)
      )
    );

    // Set isSet$ observable
    this.isSet$ = this._patternSubject.asObservable().pipe(
      distinctUntilChanged(),
      map((pattern) => typeof pattern === 'string' && 0 < pattern.length)
    );
  }

  private __evalQueryParams(queryParams: IQueryParams): string {
    const { search } = queryParams;
    if (isString(search)) {
      return search;
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
