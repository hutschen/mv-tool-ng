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

import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CRUDService, IPage } from './crud.service';
import { DownloadService } from './download.service';
import { IProject, Project, ProjectService } from './project.service';
import { IQueryParams } from './query-params.service';
import { UploadService } from './upload.service';
import { IAutoNumber } from '../components/auto-number-input.component';

export interface IDocumentInput {
  reference: string | null;
  title: string;
  description: string | null;
}

export interface IDocumentPatch
  extends Omit<Partial<IDocumentInput>, 'reference'> {
  reference?: string | IAutoNumber | null;
}

export interface IDocument extends IDocumentInput {
  id: number;
  project: IProject;
  completion_count?: number;
  completed_count?: number;
  verification_count?: number;
  verified_count?: number;
}

export class Document implements IDocument {
  id: number;
  reference: string | null;
  title: string;
  description: string | null;
  project: Project;
  completion_count: number;
  completed_count: number;
  verification_count: number;
  verified_count: number;

  constructor(document: IDocument) {
    this.id = document.id;
    this.reference = document.reference;
    this.title = document.title;
    this.description = document.description;
    this.project = new Project(document.project);
    this.completion_count = document.completion_count ?? 0;
    this.completed_count = document.completed_count ?? 0;
    this.verification_count = document.verification_count ?? 0;
    this.verified_count = document.verified_count ?? 0;
  }

  toDocumentInput(): IDocumentInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
    };
  }
}

export interface IDocumentRepresentation {
  id: number;
  reference?: string | null;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(
    protected _crud_document: CRUDService<
      IDocumentInput,
      IDocument,
      IDocumentPatch
    >,
    protected _crud_str: CRUDService<null, string>,
    protected _crud_repr: CRUDService<null, IDocumentRepresentation>,
    protected _download: DownloadService,
    protected _upload: UploadService,
    protected _projects: ProjectService
  ) {}

  getDocumentsUrl(projectId: number): string {
    return `${this._projects.getProjectUrl(projectId)}/documents`;
  }

  getDocumentUrl(documentId: number): string {
    return `documents/${documentId}`;
  }

  queryDocuments(params: IQueryParams = {}) {
    return this._crud_document.query('documents', params).pipe(
      map((documents) => {
        if (Array.isArray(documents)) {
          return documents.map((d) => new Document(d));
        } else {
          return {
            ...documents,
            items: documents.items.map((d) => new Document(d)),
          } as IPage<Document>;
        }
      })
    );
  }

  createDocument(
    projectId: number,
    documentInput: IDocumentInput
  ): Observable<Document> {
    return this._crud_document
      .create(this.getDocumentsUrl(projectId), documentInput)
      .pipe(map((document) => new Document(document)));
  }

  getDocument(documentId: number): Observable<Document> {
    return this._crud_document
      .read(this.getDocumentUrl(documentId))
      .pipe(map((document) => new Document(document)));
  }

  updateDocument(
    documentId: number,
    documentInput: IDocumentInput
  ): Observable<Document> {
    return this._crud_document
      .update(this.getDocumentUrl(documentId), documentInput)
      .pipe(map((document) => new Document(document)));
  }

  patchDocuments(
    documentPatch: IDocumentPatch,
    params: IQueryParams = {}
  ): Observable<Document[]> {
    return this._crud_document
      .patchMany('documents', documentPatch, params)
      .pipe(map((documents) => documents.map((d) => new Document(d))));
  }

  deleteDocument(documentId: number): Observable<null> {
    return this._crud_document.delete(this.getDocumentUrl(documentId));
  }

  deleteDocuments(params: IQueryParams = {}): Observable<null> {
    return this._crud_document.delete('documents', params);
  }

  getDocumentFieldNames(params: IQueryParams = {}) {
    return this._crud_str.query('document/field-names', params) as Observable<
      string[]
    >;
  }

  getDocumentReferences(params: IQueryParams = {}) {
    return this._crud_str.query('document/references', params);
  }

  getDocumentRepresentations(params: IQueryParams = {}) {
    return this._crud_repr.query('document/representations', params);
  }

  downloadDocumentExcel(params: IQueryParams = {}) {
    return this._download.download('excel/documents', params);
  }

  getDocumentExcelColumnNames(): Observable<string[]> {
    return this._crud_str.query(
      'excel/documents/column-names' //
    ) as Observable<string[]>;
  }

  uploadDocumentExcel(file: File, params: IQueryParams = {}) {
    return this._upload.upload('excel/documents', file, params);
  }
}
