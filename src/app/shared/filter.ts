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

import { Observable, of } from 'rxjs';
import { IQueryParams } from './services/crud.service';

export class FilterByPattern {
  constructor(public name: string, public pattern: string = '') {}

  get isSet(): boolean {
    return this.pattern.length > 0;
  }

  get queryParams(): IQueryParams {
    return this.isSet ? { [this.name]: this.pattern } : {};
  }
}

export interface IFilterOption {
  label: string;
  value: string | number;
}

export class FilterByValues {
  values: string[] | number[] = [];

  constructor(public name: string, protected _options?: IFilterOption[]) {}

  get isSet(): boolean {
    return this.values.length > 0;
  }

  get queryParams(): IQueryParams {
    return this.isSet ? { [this.name]: this.values } : {};
  }

  get selectableValues(): Observable<IFilterOption[]> {
    if (this._options) return of(this._options);
    else throw new Error('No selectable values defined');
  }
}

export class FilterForExistence {
  constructor(public name: string, public exists: boolean | null = null) {}

  get isSet(): boolean {
    return this.exists !== null;
  }

  get queryParams(): IQueryParams {
    return this.isSet ? { [this.name]: this.exists as boolean } : {};
  }
}

export class Filterable {
  constructor(
    public filterByPattern?: FilterByPattern,
    public filterByValues?: FilterByValues,
    public filterForExistence?: FilterForExistence
  ) {}

  get filterableByPattern(): boolean {
    return this.filterByPattern !== undefined;
  }

  get filterableByValues(): boolean {
    return this.filterByValues !== undefined;
  }

  get filterableForExistence(): boolean {
    return this.filterForExistence !== undefined;
  }

  get queryParams(): IQueryParams {
    return {
      ...this.filterByPattern?.queryParams,
      ...this.filterByValues?.queryParams,
      ...this.filterForExistence?.queryParams,
    };
  }

  setPatternFilter(name: string): void {
    this.filterByPattern = new FilterByPattern(name);
  }

  setValuesFilter(name: string, selectableValues: IFilterOption[]): void {
    this.filterByValues = new FilterByValues(name, selectableValues);
  }

  setExistenceFilter(name: string): void {
    this.filterForExistence = new FilterForExistence(name);
  }
}
