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

import { isEqual, isInt } from 'radash';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { IQueryParams } from '../services/query-params.service';

export interface IPage {
  pageSize: number;
  pageIndex: number;
}

export class Paginator {
  readonly pageSizeOptions = [25, 50, 100];
  protected _pageSubject: BehaviorSubject<IPage>;
  readonly page$: Observable<IPage>;
  readonly queryParams$: Observable<IQueryParams>;

  constructor(
    initQueryParams: IQueryParams = {},
    public readonly enabled: boolean = true
  ) {
    // Set initial page
    this._pageSubject = new BehaviorSubject<IPage>(
      this.__evalQueryParams(initQueryParams, {
        pageSize: this.pageSizeOptions[0],
        pageIndex: 0,
      })
    );

    // Set page$ and queryParams$ observable
    this.page$ = this._pageSubject.asObservable();
    this.queryParams$ = this.page$.pipe(
      distinctUntilChanged(isEqual),
      map((page) => {
        if (this.enabled) {
          return { page_size: page.pageSize, page: page.pageIndex + 1 };
        } else return {} as IQueryParams;
      })
    );
  }

  private __evalQueryParams(
    queryParams: IQueryParams,
    fallbackPage: IPage
  ): IPage {
    const { page_size, page } = queryParams;
    if (
      isInt(page_size) &&
      isInt(page) &&
      this.pageSizeOptions.includes(page_size) &&
      page > 0
    ) {
      return {
        pageSize: page_size,
        pageIndex: page - 1,
      };
    } else return fallbackPage;
  }

  get page(): IPage {
    return this._pageSubject.value;
  }

  toFirstPage(): void {
    this._pageSubject.next({
      pageSize: this.page.pageSize,
      pageIndex: 0,
    });
  }

  toNextPage(): void {
    this._pageSubject.next({
      pageSize: this.page.pageSize,
      pageIndex: this.page.pageIndex + 1,
    });
  }

  setPage(page: IPage): void {
    this._pageSubject.next(page);
  }
}
