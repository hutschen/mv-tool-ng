import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CRUDService } from './crud.service';
import { IProject } from './project.service';

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
export class DocumentService extends CRUDService<IDocumentInput, IDocument> {
  constructor(httpClient: HttpClient, auth: AuthService) {
    super(httpClient, auth)
  }
  protected _getItemsUrl(pathArgs: object): string {
    throw new Error('Method not implemented.');
  }
  protected _getItemUrl(pathArgs: object): string {
    throw new Error('Method not implemented.');
  }
}
