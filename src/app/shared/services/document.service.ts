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
import { CRUDService } from './crud.service';
import { IProject, Project, ProjectService } from './project.service';

export interface IDocumentInput {
  reference: string | null;
  title: string;
  description: string | null;
}

export interface IDocument extends IDocumentInput {
  id: number;
  project: IProject;
}

export class Document implements IDocument {
  id: number;
  reference: string | null;
  title: string;
  description: string | null;
  project: Project;

  constructor(document: IDocument) {
    this.id = document.id;
    this.reference = document.reference;
    this.title = document.title;
    this.description = document.description;
    this.project = new Project(document.project);
  }

  toDocumentInput(): IDocumentInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(
    protected _crud: CRUDService<IDocumentInput, IDocument>,
    protected _projects: ProjectService
  ) {}

  getDocumentsUrl(projectId: number): string {
    return `${this._projects.getProjectUrl(projectId)}/documents`;
  }

  getDocumentUrl(documentId: number): string {
    return `documents/${documentId}`;
  }

  async listDocuments(projectId: number): Promise<Document[]> {
    const documents = await this._crud.list(this.getDocumentsUrl(projectId));
    return documents.map((document) => new Document(document));
  }

  async createDocument(
    projectId: number,
    documentInput: IDocumentInput
  ): Promise<Document> {
    const document = await this._crud.create(
      this.getDocumentsUrl(projectId),
      documentInput
    );
    return new Document(document);
  }

  async getDocument(documentId: number): Promise<Document> {
    const document = await this._crud.read(this.getDocumentUrl(documentId));
    return new Document(document);
  }

  async updateDocument(
    documentId: number,
    documentInput: IDocumentInput
  ): Promise<Document> {
    const document = await this._crud.update(
      this.getDocumentUrl(documentId),
      documentInput
    );
    return new Document(document);
  }

  async deleteDocument(documentId: number): Promise<null> {
    return this._crud.delete(this.getDocumentUrl(documentId));
  }
}
