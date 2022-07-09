import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { JiraProjectService } from './jira-project.service';

export interface IJiraIssueStatus {
  name: string,
  color_name: string,
  completed: boolean
}

export interface IJiraIssueInput {
  summary: string,
  description: string | null,
  issuetype_id: string,
}

export interface IJiraIssue extends IJiraIssueInput {
  id: string,
  key: string,
  project_id: string,
  status: IJiraIssueStatus,
  url: string,
}

@Injectable({
  providedIn: 'root'
})
export class JiraIssueService {

  constructor(
    protected _crud: CRUDService<IJiraIssueInput, IJiraIssue>,
    protected _jiraProjects: JiraProjectService) {}

  getJiraIssuesUrl(jiraProjectId: string) : string {
    return `${this._jiraProjects.getJiraProjectUrl(jiraProjectId)}/issues`
  }

  getJiraIssueUrl(jiraIssueId: string): string {
    return `jira/issues/${jiraIssueId}`
  }

  async getJiraIssues(jiraProjectId: string): Promise<IJiraIssue[]> {
    return this._crud.list(this.getJiraIssuesUrl(jiraProjectId))
  }

  async createJiraIssue(
      jiraProjectId: string, 
      jiraIssueInput: IJiraIssueInput): Promise<IJiraIssue> {
    return this._crud.create(
      this.getJiraIssuesUrl(jiraProjectId), jiraIssueInput)
  }

  async getJiraIssue(jiraIssueId: string): Promise<IJiraIssue> {
    return this._crud.read(this.getJiraIssueUrl(jiraIssueId))
  }
}
