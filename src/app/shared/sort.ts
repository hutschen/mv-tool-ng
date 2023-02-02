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

import { BehaviorSubject, map, Observable } from 'rxjs';
import { IQueryParams } from './services/crud.service';

export interface ISort {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export class Sorting {
  protected _sortSubject = new BehaviorSubject<ISort | null>(null);
  readonly queryParams$: Observable<IQueryParams> = this._sortSubject
    .asObservable()
    .pipe(
      map((sort) => {
        if (sort && sort.direction) {
          return { sort_by: sort.active, sort_order: sort.direction };
        } else return {} as IQueryParams;
      })
    );

  constructor() {}

  setSort(sort: ISort): void {
    this._sortSubject.next(sort);
  }
}
