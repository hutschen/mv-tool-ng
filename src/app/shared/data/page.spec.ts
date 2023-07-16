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

import { S } from '@angular/cdk/keycodes';
import { IPage, Paginator } from './page';

describe('Paginator', () => {
  const initQueryParams = {
    page: 1,
    page_size: 25,
  };
  let sut: Paginator;

  beforeEach(() => {
    sut = new Paginator(initQueryParams);
  });

  it('should be created', (done: DoneFn) => {
    // Test if initial query params are loaded
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual(initQueryParams);
      done();
    });
  });

  it('should not load invalid query params', (done: DoneFn) => {
    const invalidQueryParams = {
      page: 0,
      page_size: 0,
    };
    sut = new Paginator(invalidQueryParams);
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: 1,
        page_size: sut.pageSizeOptions[0],
      });
      done();
    });
  });

  it('should set page', (done: DoneFn) => {
    const page: IPage = {
      pageIndex: 2,
      pageSize: sut.pageSizeOptions[0],
    };
    sut.setPage(page);
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: page.pageIndex + 1,
        page_size: page.pageSize,
      });
      done();
    });
  });

  it('should get page', () => {
    expect(sut.page).toEqual({
      pageIndex: initQueryParams.page - 1,
      pageSize: initQueryParams.page_size,
    });
  });

  it('should set page to first page', (done: DoneFn) => {
    sut.toFirstPage();
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: 1,
        page_size: sut.pageSizeOptions[0],
      });
      done();
    });
  });

  it('should set page to last page', (done: DoneFn) => {
    const itemCount = 120;
    const pageSize = initQueryParams.page_size;
    const lastPageIndex = Math.ceil(itemCount / pageSize);

    sut.toLastPage(itemCount);
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: lastPageIndex,
        page_size: pageSize,
      });
      done();
    });
  });

  it('should set page to next page', (done: DoneFn) => {
    sut.toNextPage();
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: initQueryParams.page + 1,
        page_size: initQueryParams.page_size,
      });
      done();
    });
  });

  it('should stay on the first page when trying to switch to the previous page', (done: DoneFn) => {
    sut.toPreviousPage();
    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: 1,
        page_size: initQueryParams.page_size,
      });
      done();
    });
  });

  it('should set page to the previous page', (done: DoneFn) => {
    sut.toNextPage();
    sut.toPreviousPage();

    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        page: 1,
        page_size: initQueryParams.page_size,
      });
      done();
    });
  });
});
