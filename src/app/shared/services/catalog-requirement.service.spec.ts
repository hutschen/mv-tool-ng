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
  CatalogRequirementService,
  ICatalogRequirementInput,
  ICatalogRequirement,
  CatalogRequirement,
} from './catalog-requirement.service';
import { AuthService } from './auth.service';

describe('CatalogRequirementService', () => {
  let sut: CatalogRequirementService;
  let crud: CRUDService<ICatalogRequirementInput, ICatalogRequirement>;
  let httpMock: HttpTestingController;
  let inputMock: ICatalogRequirementInput;
  let outputMock: ICatalogRequirement;

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
    sut = TestBed.inject(CatalogRequirementService);

    inputMock = {
      reference: null,
      summary: 'A test catalog requirement',
      description: 'A test catalog requirement description',
      target_object: null,
      compliance_status: null,
      compliance_comment: null,
    };
    outputMock = {
      id: 1,
      reference: inputMock.reference,
      summary: inputMock.summary,
      description: inputMock.description,
      target_object: inputMock.target_object,
      compliance_status: inputMock.compliance_status,
      compliance_comment: inputMock.compliance_comment,
      catalog_module: {
        id: 1,
        reference: null,
        title: 'A test catalog module',
        description: null,
        gs_reference: null,
        catalog: {
          id: 1,
          reference: null,
          title: 'A test catalog',
          description: null,
        },
      },
      gs_anforderung_reference: null,
      gs_absicherung: null,
      gs_verantwortliche: null,
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return catalog requirements url', () => {
    const catalogModuleId = outputMock.catalog_module.id;
    expect(sut.getCatalogRequirementsUrl(catalogModuleId)).toEqual(
      `catalog-modules/${catalogModuleId}/catalog-requirements`
    );
  });

  it('should return catalog requirement url', () => {
    const catalogRequirementId = outputMock.id;
    expect(sut.getCatalogRequirementUrl(catalogRequirementId)).toEqual(
      `catalog-requirements/${catalogRequirementId}`
    );
  });

  it('should list catalog requirements', (done: DoneFn) => {
    const catalogModuleId = outputMock.catalog_module.id;
    const catalogRequirementsList = [outputMock];

    sut.listCatalogRequirements(catalogModuleId).then((value) => {
      expect(value).toEqual(
        catalogRequirementsList.map((cr) => new CatalogRequirement(cr))
      );
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getCatalogRequirementsUrl(catalogModuleId)),
    });
    mockResponse.flush(catalogRequirementsList);
  });

  it('should create catalog requirement', (done: DoneFn) => {
    const catalogModuleId = outputMock.catalog_module.id;

    sut.createCatalogRequirement(catalogModuleId, inputMock).then((value) => {
      expect(value).toEqual(new CatalogRequirement(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getCatalogRequirementsUrl(catalogModuleId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get catalog requirement', (done: DoneFn) => {
    const catalogRequirementId = outputMock.id;

    sut.getCatalogRequirement(catalogRequirementId).then((value) => {
      expect(value).toEqual(new CatalogRequirement(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(
        sut.getCatalogRequirementUrl(catalogRequirementId)
      ),
    });
    mockResponse.flush(outputMock);
  });

  it('should update catalog requirement', (done: DoneFn) => {
    const catalogRequirementId = outputMock.id;

    sut
      .updateCatalogRequirement(catalogRequirementId, inputMock)
      .then((value) => {
        expect(value).toEqual(new CatalogRequirement(outputMock));
        done();
      });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(
        sut.getCatalogRequirementUrl(catalogRequirementId)
      ),
    });
    mockResponse.flush(outputMock);
  });

  it('should delete catalog requirement', (done: DoneFn) => {
    sut.deleteCatalogRequirement(outputMock.id).then((value) => {
      expect(value).toBeNull();
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getCatalogRequirementUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });
});
