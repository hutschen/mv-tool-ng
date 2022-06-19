import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IProject, ProjectService } from './project.service';

export interface IDocumentInput {
  reference?: string | null
  title: string
  description?: string | null
}

export interface IDocument extends IDocumentInput {
  id: number
  project: IProject
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    protected _crud: CRUDService<IDocumentInput, IDocument>,
    protected _projects: ProjectService) {}

  getDocumentsUrl(projectId: number): string {
    return `${this._projects.getProjectUrl(projectId)}/documents`
  }

  getDocumentUrl(documentId: number): string {
    return `documents/${documentId}`
  }

  async listDocuments(projectId: number): Promise<IDocument[]> {
    return this._crud.list(this.getDocumentsUrl(projectId))
  }

  async createDocument(
    projectId: number, documentInput: IDocumentInput): Promise<IDocument> {
    return this._crud.create(this.getDocumentsUrl(projectId), documentInput)
  }

  async getDocument(documentId: number): Promise<IDocument> {
    return this._crud.read(this.getDocumentUrl(documentId))
  }

  async updateDocument(
    documentId: number, documentInput: IDocumentInput): Promise<IDocument> {
    return this._crud.update(this.getDocumentUrl(documentId), documentInput)
  }

  async deleteDocument(documentId: number): Promise<null> {
    return this._crud.delete(this.getDocumentUrl(documentId))
  }
}
