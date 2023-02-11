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

import { isEqual, isString } from 'radash';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
} from 'rxjs';
import { IQueryParams } from '../services/query-params.service';

export type SortDirection = 'asc' | 'desc' | '';

export interface ISort {
  active: string;
  direction: SortDirection;
}

const defaultSort: ISort = { active: '', direction: '' };

export class Sorting {
  protected _sortSubject: BehaviorSubject<ISort>;
  readonly active$: Observable<string>;
  readonly direction$: Observable<SortDirection>;
  readonly isSorted$: Observable<boolean>;
  readonly queryParams$: Observable<IQueryParams>;

  constructor(initQueryParams: IQueryParams = {}) {
    // Set initial sort
    this._sortSubject = new BehaviorSubject<ISort>(
      this.__evalQueryParams(initQueryParams, defaultSort)
    );

    // Set observables
    this.active$ = this._sortSubject.asObservable().pipe(
      map((sort) => sort.active),
      distinctUntilChanged()
    );

    this.direction$ = this._sortSubject.asObservable().pipe(
      map((sort) => sort.direction),
      distinctUntilChanged()
    );

    const sort$ = this._sortSubject.asObservable();
    this.isSorted$ = sort$.pipe(
      map(({ active, direction }) => Boolean(active && direction)),
      distinctUntilChanged()
    );

    this.queryParams$ = sort$.pipe(
      map(({ active, direction }) => {
        if (active && direction) {
          return { sort_by: active, sort_order: direction };
        } else return {} as IQueryParams;
      }),
      distinctUntilChanged(isEqual)
    );
  }

  private __evalQueryParams(
    queryParams: IQueryParams,
    fallbackSort: ISort
  ): ISort {
    const { sort_by, sort_order } = queryParams;
    // test for type 'asc' | 'desc' | ''
    if (
      isString(sort_by) &&
      isString(sort_order) &&
      ['asc', 'desc', ''].includes(sort_order)
    ) {
      return { active: sort_by, direction: sort_order as SortDirection };
    } else return fallbackSort;
  }

  setSort(sort: ISort): void {
    this._sortSubject.next(sort);
  }

  clearSort(): void {
    this._sortSubject.next(defaultSort);
  }
}
