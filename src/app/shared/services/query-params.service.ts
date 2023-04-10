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

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { isEmpty, mapValues } from 'radash';
import { Observable, from, debounceTime } from 'rxjs';
import { exhaustLatestMap } from '../exhaust-latest-map';

interface IRawQueryParams {
  [param: string]: string | ReadonlyArray<string>;
}

export interface IQueryParams {
  [param: string]:
    | string
    | number
    | boolean
    | ReadonlyArray<string | number | boolean>;
}

function isBool(value: string): boolean {
  return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
}

function convertToBool(value: string): boolean {
  if (value.toLowerCase() === 'true') return true;
  else return false;
}

function isInt(value: string): boolean {
  return /^\d+$/.test(value);
}

function convertToInt(value: string): number {
  return parseInt(value, 10);
}

function convertRawQueryParams(rawQueryParams: IRawQueryParams): IQueryParams {
  return mapValues(rawQueryParams, (value) => {
    if (Array.isArray(value)) {
      if (value.every(isBool)) {
        return value.map((v) => convertToBool(v));
      } else if (value.every(isInt)) {
        return value.map((v) => convertToInt(v));
      } else {
        return value;
      }
    } else {
      if (isBool(value as string)) {
        return convertToBool(value as string);
      } else if (isInt(value as string)) {
        return convertToInt(value as string);
      } else {
        return value;
      }
    }
  });
}

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  protected _cachedQueryParams: Map<string, IQueryParams> = new Map();

  constructor(protected _router: Router) {}

  protected get currentUrl(): string {
    return this._router.url.split('?')[0];
  }

  getQueryParams(): IQueryParams {
    const queryParams = convertRawQueryParams(
      this._router.routerState.snapshot.root.queryParams
    );

    if (isEmpty(queryParams)) {
      return this._cachedQueryParams.get(this.currentUrl) || {};
    } else {
      this._cachedQueryParams.set(this.currentUrl, queryParams);
      return queryParams;
    }
  }

  async setQueryParams(queryParams: IQueryParams): Promise<boolean> {
    return this._router
      .navigate([], {
        queryParams,
        replaceUrl: true,
      })
      .then((navSucceeded) => {
        if (navSucceeded) {
          this._cachedQueryParams.set(this.currentUrl, queryParams);
        }
        return navSucceeded;
      });
  }

  syncQueryParams(
    outgoingQueryParams$: Observable<IQueryParams>,
    delay: number = 250
  ): Observable<boolean> {
    return outgoingQueryParams$.pipe(
      debounceTime(delay),
      exhaustLatestMap((queryParams) => from(this.setQueryParams(queryParams)))
    );
  }
}
