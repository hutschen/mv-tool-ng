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
  CatalogModuleService,
  ICatalogModuleInput,
  ICatalogModule,
  CatalogModule,
} from './catalog-module.service';
import { AuthService } from './auth.service';

describe('CatalogModuleService', () => {
  let sut: CatalogModuleService;
  let crud: CRUDService<ICatalogModuleInput, ICatalogModule>;
  let httpMock: HttpTestingController;
  let inputMock: ICatalogModuleInput;
  let outputMock: ICatalogModule;

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
    sut = TestBed.inject(CatalogModuleService);

    inputMock = {
      reference: null,
      title: 'A test catalog module',
      description: 'A test catalog module description',
    };
    outputMock = {
      id: 1,
      reference: inputMock.reference,
      title: inputMock.title,
      description: inputMock.description,
      catalog: {
        id: 1,
        reference: null,
        title: 'A test catalog',
        description: 'A test catalog description',
      },
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return catalog modules url', () => {
    const catalogId = outputMock.catalog.id;
    expect(sut.getCatalogModulesUrl(catalogId)).toEqual(
      `catalogs/${catalogId}/catalog-modules`
    );
  });

  it('should return catalog module url', () => {
    const catalogModuleId = outputMock.id;
    expect(sut.getCatalogModuleUrl(catalogModuleId)).toEqual(
      `catalog-modules/${catalogModuleId}`
    );
  });

  it('should query catalog modules', (done: DoneFn) => {
    const catalogId = outputMock.catalog.id;
    const catalogModulesList = [outputMock];

    sut.queryCatalogModules({ catalogId }).subscribe({
      next: (value) =>
        expect(value).toEqual(
          catalogModulesList.map((cm) => new CatalogModule(cm))
        ),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(`catalog-modules?catalogId=${catalogId}`),
    });
    mockResponse.flush(catalogModulesList);
  });

  it('should create catalog module', (done: DoneFn) => {
    const catalogId = outputMock.catalog.id;

    sut.createCatalogModule(catalogId, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new CatalogModule(outputMock)),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getCatalogModulesUrl(catalogId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get catalog module', (done: DoneFn) => {
    const catalogModuleId = outputMock.id;

    sut.getCatalogModule(catalogModuleId).subscribe({
      next: (value) => expect(value).toEqual(new CatalogModule(outputMock)),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getCatalogModuleUrl(catalogModuleId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update catalog module', (done: DoneFn) => {
    const catalogModuleId = outputMock.id;

    sut.updateCatalogModule(catalogModuleId, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new CatalogModule(outputMock)),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getCatalogModuleUrl(catalogModuleId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should patch catalog modules', (done: DoneFn) => {
    sut.patchCatalogModules(inputMock).subscribe({
      next: (value) => expect(value).toEqual([new CatalogModule(outputMock)]),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'patch',
      url: crud.toAbsoluteUrl('catalog-modules'),
    });
    mockResponse.flush([outputMock]);
  });

  it('should delete catalog module', (done: DoneFn) => {
    const catalogModuleId = outputMock.id;

    sut.deleteCatalogModule(catalogModuleId).subscribe({
      next: (value) => expect(value).toBeNull(),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getCatalogModuleUrl(catalogModuleId)),
    });
    mockResponse.flush(null);
  });
});
