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
import { ProjectService } from './project.service';
import {
  DocumentService,
  IDocumentInput,
  IDocument,
  Document,
} from './document.service';
import { AuthService } from './auth.service';

describe('DocumentService', () => {
  let sut: DocumentService;
  let crud: CRUDService<IDocumentInput, IDocument>;
  let projects: ProjectService;
  let httpMock: HttpTestingController;
  let inputMock: IDocumentInput;
  let outputMock: IDocument;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.inject(AuthService).setAccessToken({
      access_token: 'token',
      token_type: 'bearer',
    });
    crud = TestBed.inject(CRUDService);
    projects = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(DocumentService);

    inputMock = {
      reference: null,
      title: 'A test document',
      description: 'A test document description',
    };
    outputMock = {
      id: 1,
      reference: inputMock.reference,
      title: inputMock.title,
      description: inputMock.description,
      project: {
        id: 1,
        name: 'A test project',
        description: 'A test project description',
        jira_project_id: null,
        jira_project: null,
      },
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return documents url', () => {
    expect(sut.getDocumentsUrl(outputMock.project.id)).toEqual(
      `${projects.getProjectUrl(outputMock.project.id)}/documents`
    );
  });

  it('should return document url', () => {
    expect(sut.getDocumentUrl(outputMock.id)).toEqual(
      `documents/${outputMock.id}`
    );
  });

  it('should query documents', (done: DoneFn) => {
    const projectId = outputMock.project.id;
    sut.queryDocuments({ projectId }).subscribe({
      next: (value) => expect(value).toEqual([new Document(outputMock)]),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(`documents?projectId=${projectId}`),
    });
    mockResponse.flush([outputMock]);
  });

  it('should create document', (done: DoneFn) => {
    sut.createDocument(outputMock.project.id, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Document(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getDocumentsUrl(outputMock.project.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get document', (done: DoneFn) => {
    sut.getDocument(outputMock.id).subscribe({
      next: (value) => expect(value).toEqual(new Document(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getDocumentUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update document', (done: DoneFn) => {
    sut.updateDocument(outputMock.id, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Document(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getDocumentUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should patch document', (done: DoneFn) => {
    sut.patchDocuments(inputMock).subscribe({
      next: (value) => expect(value).toEqual([new Document(outputMock)]),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'patch',
      url: crud.toAbsoluteUrl('documents'),
    });
    mockResponse.flush([outputMock]);
  });

  it('should delete document', (done: DoneFn) => {
    sut.deleteDocument(outputMock.id).subscribe({
      next: (value) => expect(value).toBeNull(),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getDocumentUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });
});
