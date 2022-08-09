import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { JiraProjectService } from './jira-project.service';
import { MeasureService } from './measure.service';

export interface IJiraIssueStatus {
  name: string;
  color_name: string;
  completed: boolean;
}

export interface IJiraIssueInput {
  summary: string;
  description: string | null;
  issuetype_id: string;
}

export interface IJiraIssue extends IJiraIssueInput {
  id: string;
  key: string;
  project_id: string;
  status: IJiraIssueStatus;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class JiraIssueService {
  constructor(
    protected _crud: CRUDService<IJiraIssueInput, IJiraIssue>,
    protected _jiraProjects: JiraProjectService,
    protected _measureService: MeasureService
  ) {}

  getJiraIssuesUrl(jiraProjectId: string): string {
    return `${this._jiraProjects.getJiraProjectUrl(jiraProjectId)}/jira-issues`;
  }

  getJiraIssueUrl(measureId: number): string {
    return `${this._measureService.getMeasureUrl(measureId)}/jira-issue`;
  }

  async getJiraIssues(jiraProjectId: string): Promise<IJiraIssue[]> {
    return this._crud.list(this.getJiraIssuesUrl(jiraProjectId));
  }

  async createJiraIssue(
    measureId: number,
    jiraIssueInput: IJiraIssueInput
  ): Promise<IJiraIssue> {
    return this._crud.create(this.getJiraIssueUrl(measureId), jiraIssueInput);
  }

  async getJiraIssue(measureId: number): Promise<IJiraIssue> {
    return this._crud.read(this.getJiraIssueUrl(measureId));
  }

  async unlinkJiraIssue(measureId: number): Promise<null> {
    return this._crud.delete(this.getJiraIssueUrl(measureId));
  }
}
