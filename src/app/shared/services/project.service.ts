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
import { IJiraProject } from './jira-project.service';

export interface IProjectInput {
  name: string;
  description: string | null;
  jira_project_id: string | null;
}

export interface IProject extends IProjectInput {
  id: number;
  jira_project: IJiraProject | null;
  completion: number | null;
}

export class Project implements IProject {
  id: number;
  name: string;
  description: string | null;
  jira_project_id: string | null;
  jira_project: IJiraProject | null;
  completion: number | null;

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

  get percentComplete(): number | null {
    if (this.completion === null) {
      return null;
    } else {
      return Math.round(this.completion * 100);
    }
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
