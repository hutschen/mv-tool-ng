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

export interface IPage {
  pageSize: number;
  pageIndex: number;
}

export class Paginator {
  readonly pageSizeOptions = [25, 50, 100];
  protected _pageSubject = new BehaviorSubject<IPage>({
    pageSize: this.pageSizeOptions[0],
    pageIndex: 0,
  });
  readonly page$: Observable<IPage> = this._pageSubject.asObservable();
  readonly queryParams$: Observable<IQueryParams> = this.page$.pipe(
    map((page) => {
      if (this.enabled) {
        return { page_size: page.pageSize, page: page.pageIndex + 1 };
      } else return {} as IQueryParams;
    })
  );

  constructor(public readonly enabled: boolean = true) {}

  get page(): IPage {
    return this._pageSubject.value;
  }

  toFirstPage(): void {
    this._pageSubject.next({
      pageSize: this.page.pageSize,
      pageIndex: 0,
    });
  }

  setPage(page: IPage): void {
    this._pageSubject.next(page);
  }
}
