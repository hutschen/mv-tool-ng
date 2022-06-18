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

interface IProjectPathArgs {
  projectId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends CRUDService<IProjectInput, IProject> {
  constructor(httpClient: HttpClient, auth: AuthService) {
    super(httpClient, auth)
  }

  protected _getItemsUrl(pathArgs = {}): string {
    return `${this._baseUrl}/projects`;
  }

  protected _getItemUrl(pathArgs: IProjectPathArgs): string {
    return `${this._baseUrl}/projects/${pathArgs.projectId}`;
  }

  async list(): Promise<IProject[]> {
    return this._list()
  }

  async create(project: IProjectInput): Promise<IProject> {
    return this._create(project)
  }

  async read(projectId: number): Promise<IProject> {
    let pathArgs: IProjectPathArgs = {projectId: projectId}
    return this._read(pathArgs)
  }

  async update(projectId: number, project: IProjectInput): Promise<IProject> {
    let pathArgs: IProjectPathArgs = {projectId: projectId}
    return this._update(project, pathArgs)
  }

  async delete(projectId: number): Promise<null> {
    let pathArgs: IProjectPathArgs = {projectId: projectId}
    return this._delete(pathArgs)
  }
}