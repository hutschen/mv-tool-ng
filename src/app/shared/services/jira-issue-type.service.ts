import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { JiraProjectService } from './jira-project.service';

export interface IJiraIssueType {
  id: string
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class JiraIssueTypeService {

  constructor(
    protected _crud: CRUDService<IJiraIssueType, IJiraIssueType>,
    protected _projects: JiraProjectService) {}

  getJiraIssueTypesUrl(jiraProjectId: string) : string {
    return `${this._projects.getJiraProjectUrl(jiraProjectId)}/issuetypes`
  }

  async getJiraIssueTypes(jiraProjectId: string): Promise<IJiraIssueType[]> {
    return this._crud.list(this.getJiraIssueTypesUrl(jiraProjectId))
  }
}
