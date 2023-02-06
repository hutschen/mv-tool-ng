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
import { mapValues } from 'radash';

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

function convertToQueryParams(rawQueryParams: IRawQueryParams): IQueryParams {
  return mapValues(rawQueryParams, (value) => {
    if (Array.isArray(value)) {
      if (value.every((v) => isBool(v))) {
        return value.map((v) => convertToBool(v));
      } else if (value.every((v) => isInt(v))) {
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
  constructor(protected _router: Router) {}
}
