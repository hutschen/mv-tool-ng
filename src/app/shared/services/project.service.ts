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
  jira_project: IJiraProject | null;
  completion: number;
}

export class Project implements IProject {
  id: number;
  name: string;
  description: string | null;
  jira_project_id: string | null;
  jira_project: IJiraProject | null;
  completion: number;

  constructor(project: IProject) {
    this.id = project.id;
    this.name = project.name;
    this.description = project.description;
    this.jira_project_id = project.jira_project_id;
    this.jira_project = project.jira_project;
    this.completion = project.completion;
  }

  toProjectInput(): IProjectInput {
    return {
      name: this.name,
      description: this.description,
      jira_project_id: this.jira_project_id,
    };
  }

  get hasJiraProject(): boolean {
    return this.jira_project !== null || this.jira_project_id !== null;
  }

  get hasPermissionOnJiraProject(): boolean {
    return (
      (this.jira_project === null && this.jira_project_id === null) ||
      (this.jira_project !== null && this.jira_project_id !== null)
    );
  }

  get percentComplete(): number {
    return Math.round(this.completion * 100);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(protected _crud: CRUDService<IProjectInput, IProject>) {}

  getProjectsUrl(): string {
    return 'projects';
  }

  getProjectUrl(projectId: number): string {
    return `${this.getProjectsUrl()}/${projectId}`;
  }

  async listProjects(): Promise<Project[]> {
    const projects = await this._crud.list(this.getProjectsUrl());
    return projects.map((project) => new Project(project));
  }

  async createProject(projectInput: IProjectInput): Promise<Project> {
    const project = await this._crud.create(
      this.getProjectsUrl(),
      projectInput
    );
    return new Project(project);
  }

  async getProject(projectId: number): Promise<Project> {
    const project = await this._crud.read(this.getProjectUrl(projectId));
    return new Project(project);
  }

  async updateProject(
    projectId: number,
    projectInput: IProjectInput
  ): Promise<Project> {
    const project = await this._crud.update(
      this.getProjectUrl(projectId),
      projectInput
    );
    return new Project(project);
  }

  async deleteProject(projectId: number): Promise<null> {
    return this._crud.delete(this.getProjectUrl(projectId));
  }
}
