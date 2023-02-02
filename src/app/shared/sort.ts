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

import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { IQueryParams } from './services/crud.service';

export class Sort {
  protected _sortBySubject = new BehaviorSubject<string | undefined>(undefined);
  protected _sortOrderSubject = new BehaviorSubject<'asc' | 'desc' | ''>('');
  readonly queryParams$: Observable<IQueryParams> = combineLatest([
    this._sortBySubject.asObservable(),
    this._sortOrderSubject.asObservable(),
  ]).pipe(
    map(([sortBy, sortOrder]) => {
      if (sortBy && sortOrder) {
        return { sort_by: sortBy, sort_order: sortOrder };
      } else return {} as IQueryParams;
    })
  );

  constructor() {}

  set sortBy(sortBy: string | undefined) {
    this._sortBySubject.next(sortBy);
  }

  set sortOrder(sortOrder: 'asc' | 'desc' | '') {
    this._sortOrderSubject.next(sortOrder);
  }
}
