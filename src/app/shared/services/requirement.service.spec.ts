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
  RequirementService,
  IRequirementInput,
  IRequirement,
  Requirement,
} from './requirement.service';
import { AuthService } from './auth.service';

describe('RequirementService', () => {
  let sut: RequirementService;
  let crud: CRUDService<IRequirementInput, IRequirement>;
  let httpMock: HttpTestingController;
  let inputMock: IRequirementInput;
  let outputMock: IRequirement;

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
    sut = TestBed.inject(RequirementService);

    inputMock = {
      summary: 'A test requirement',
    };
    outputMock = {
      id: 1,
      summary: inputMock.summary,
      project: {
        id: 1,
        name: 'A test project',
      },
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return requirements url', () => {
    const projectId = outputMock.project.id;
    expect(sut.getRequirementsUrl(projectId)).toEqual(
      `projects/${projectId}/requirements`
    );
  });

  it('should return requirement url', () => {
    const requirementId = outputMock.id;
    expect(sut.getRequirementUrl(requirementId)).toEqual(
      `requirements/${requirementId}`
    );
  });

  it('should query requirements', (done: DoneFn) => {
    const projectId = outputMock.project.id;
    const requirementsList = [outputMock];

    sut.queryRequirements({ projectId }).subscribe({
      next: (value) => {
        expect(value).toEqual(
          requirementsList.map((requirement) => new Requirement(requirement))
        );
      },
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getRequirementsUrl(projectId)),
    });
    mockResponse.flush(requirementsList);
  });

  it('should create requirement', (done: DoneFn) => {
    const projectId = outputMock.project.id;

    sut.createRequirement(projectId, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Requirement(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getRequirementsUrl(projectId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get a requirement', (done: DoneFn) => {
    sut.getRequirement(outputMock.id).subscribe({
      next: (value) => expect(value).toEqual(new Requirement(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getRequirementUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update a requirement', (done: DoneFn) => {
    sut.updateRequirement(outputMock.id, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Requirement(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getRequirementUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should delete a requirement', (done: DoneFn) => {
    sut.deleteRequirement(outputMock.id).subscribe({
      next: (value) => expect(value).toBeNull(),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getRequirementUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });

  it('should import requirements', (done: DoneFn) => {
    const projectId = outputMock.project.id;
    const catalogModuleIds = [1, 2, 3];
    const requirementsList = [outputMock];

    sut.importRequirements(projectId, catalogModuleIds).subscribe({
      next: (value) => {
        expect(value).toEqual(
          requirementsList.map((requirement) => new Requirement(requirement))
        );
      },
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(`${sut.getRequirementsUrl(projectId)}/import`),
    });
    mockResponse.flush(requirementsList);
  });
});
