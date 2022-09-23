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
}
