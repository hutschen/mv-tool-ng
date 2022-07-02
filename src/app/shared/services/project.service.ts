import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IJiraProject } from './jira-project.service';

export interface IProjectInput {
  name: string;
  description: string | null;
  jira_project_id: string | null;
}

export interface IProject extends IProjectInput {
  id: number;
  jira_project: IJiraProject | null
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(protected _crud: CRUDService<IProjectInput, IProject>) {}

  getProjectsUrl(): string {
    return 'projects'
  }

  getProjectUrl(projectId: number): string {
    return `${this.getProjectsUrl()}/${projectId}`
  }

  async listProjects(): Promise<IProject[]> {
    return this._crud.list(this.getProjectsUrl())
  }

  async createProject(projectInput: IProjectInput): Promise<IProject> {
    return this._crud.create(this.getProjectsUrl(), projectInput)
  }

  async getProject(projectId: number): Promise<IProject> {
    return this._crud.read(this.getProjectUrl(projectId))
  }

  async updateProject(projectId: number, projectInput: IProjectInput): Promise<IProject> {
    return this._crud.update(this.getProjectUrl(projectId), projectInput)
  }

  async deleteProject(projectId: number): Promise<null> {
    return this._crud.delete(this.getProjectUrl(projectId))
  }
}