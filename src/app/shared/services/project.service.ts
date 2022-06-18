import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { AuthService } from './auth.service';

export interface IProjectInput {
  name: string;
  description: string | null;
  jira_project_id: string | null;
}

export interface IProject extends IProjectInput {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends CRUDService<IProjectInput, IProject> {
  constructor(httpClient: HttpClient, auth: AuthService) {
    super(httpClient, auth, 'projects')
  }
}
