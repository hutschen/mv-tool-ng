import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IProject, ProjectService } from './project.service';

export interface IDocumentInput {
  reference: string | null
  title: string
  description: string | null
}

export interface IDocument {
  id: number | null
  project_id: number | null
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
    return `documents`
  }

}
