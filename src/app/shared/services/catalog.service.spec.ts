// Copyright (C) 2022 Helmar Hutschenreuter
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

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import {
  CatalogService,
  ICatalogInput,
  ICatalog,
  Catalog,
} from './catalog.service';
import { AuthService } from './auth.service';

describe('CatalogService', () => {
  let sut: CatalogService;
  let crud: CRUDService<ICatalogInput, ICatalog>;
  let httpMock: HttpTestingController;
  let inputMock: ICatalogInput;
  let outputMock: ICatalog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.inject(AuthService).setAccessToken({
      access_token: 'token',
      token_type: 'bearer',
    });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(CatalogService);

    inputMock = {
      reference: null,
      title: 'A test catalog',
      description: 'A test catalog description',
    };
    outputMock = {
      id: 1,
      reference: inputMock.reference,
      title: inputMock.title,
      description: inputMock.description,
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return catalogs url', () => {
    expect(sut.getCatalogsUrl()).toEqual('catalogs');
  });

  it('should return catalog url', () => {
    expect(sut.getCatalogUrl(outputMock.id)).toEqual(
      `catalogs/${outputMock.id}`
    );
  });

  it('should list catalogs', (done: DoneFn) => {
    const catalogList = [outputMock];
    sut.listCatalogs_legacy().subscribe({
      next: (value) =>
        expect(value).toEqual(catalogList.map((c) => new Catalog(c))),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getCatalogsUrl()),
    });
    mockResponse.flush(catalogList);
  });

  it('should create catalog', (done: DoneFn) => {
    sut.createCatalog(inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Catalog(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getCatalogsUrl()),
    });
    mockResponse.flush(outputMock);
  });

  it('should get catalog', (done: DoneFn) => {
    sut.getCatalog(outputMock.id).subscribe({
      next: (value) => expect(value).toEqual(new Catalog(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getCatalogUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update catalog', (done: DoneFn) => {
    sut.updateCatalog(outputMock.id, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Catalog(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getCatalogUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should delete catalog', (done: DoneFn) => {
    sut
      .deleteCatalog(outputMock.id)
      .subscribe({ next: (value) => expect(value).toBeNull(), complete: done });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getCatalogUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });
});
