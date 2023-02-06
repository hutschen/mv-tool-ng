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

import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
} from 'rxjs';
import { IQueryParams } from './services/query-params.service';

export interface ISort {
  active: string;
  direction: 'asc' | 'desc' | '';
}

const defaultSort: ISort = { active: '', direction: '' };

export class Sorting {
  protected _sortSubject = new BehaviorSubject<ISort>(defaultSort);
  readonly active$: Observable<string> = this._sortSubject.asObservable().pipe(
    map((sort) => sort.active),
    distinctUntilChanged()
  );
  readonly direction$: Observable<'asc' | 'desc' | ''> = this._sortSubject
    .asObservable()
    .pipe(
      map((sort) => sort.direction),
      distinctUntilChanged()
    );
  readonly isSorted$: Observable<boolean> = combineLatest([
    this.active$,
    this.direction$,
  ]).pipe(
    map(([active, direction]) => Boolean(active && direction)),
    distinctUntilChanged()
  );
  readonly queryParams$: Observable<IQueryParams> = combineLatest([
    this.active$,
    this.direction$,
  ]).pipe(
    map(([active, direction]) => {
      if (active && direction) {
        return { sort_by: active, sort_order: direction };
      } else return {} as IQueryParams;
    })
  );

  constructor() {}

  set queryParams(queryParams: IQueryParams) {
    // TODO: implement
  }

  setSort(sort: ISort): void {
    this._sortSubject.next(sort);
  }

  clearSort(): void {
    this._sortSubject.next(defaultSort);
  }
}
