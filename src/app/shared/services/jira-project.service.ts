import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';

export interface IJiraProject {
  id: string
  key: string
  name: string
  url: string
}

@Injectable({
  providedIn: 'root'
})
export class JiraProjectService {

  constructor(protected _crud: CRUDService<IJiraProject, IJiraProject>) {}

  getJiraProjectsUrl() : string {
    return 'jira-projects'
  }

  getJiraProjectUrl(jiraProjectId: string) {
    return `${this.getJiraProjectsUrl()}/${jiraProjectId}`
  }

  async getJiraProjects(): Promise<IJiraProject[]> {
    return this._crud.list(this.getJiraProjectsUrl())
  }

  async getJiraProject(jiraProjectId: string): Promise<IJiraProject> {
    return this._crud.read(this.getJiraProjectUrl(jiraProjectId))
  }
}
