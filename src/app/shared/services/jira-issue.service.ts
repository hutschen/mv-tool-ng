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
import { Observable } from 'rxjs';
import { CRUDService } from './crud.service';
import { IJiraProject, JiraProjectService } from './jira-project.service';
import { MeasureService } from './measure.service';
import { IQueryParams } from './query-params.service';
import { IUser } from './user.service';
import { IJiraIssueType } from './jira-issue-type.service';

export interface IJiraIssueStatus {
  name: string;
  color_name: string;
  completed: boolean;
}

export interface IJiraIssueInput {
  summary: string;
  description: string | null;
  assignee_id: string | null;
  issuetype_id: string;
}

export interface IJiraIssue
  extends Omit<IJiraIssueInput, 'assignee_id' | 'issuetype_id'> {
  id: string;
  key: string;
  assignee?: IUser | null;
  issuetype: IJiraIssueType;
  project: IJiraProject;
  status: IJiraIssueStatus;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class JiraIssueService {
  constructor(
    protected _crud: CRUDService<IJiraIssueInput, IJiraIssue>,
    protected _measureService: MeasureService
  ) {}

  getJiraIssuesUrl(): string {
    return 'jira-issues';
  }

  getJiraIssueUrl(measureId: number): string {
    return `${this._measureService.getMeasureUrl(measureId)}/jira-issue`;
  }

  queryJiraIssues(params: IQueryParams = {}) {
    return this._crud.query(this.getJiraIssuesUrl(), params);
  }

  createAndLinkJiraIssue(
    measureId: number,
    jiraIssueInput: IJiraIssueInput
  ): Observable<IJiraIssue> {
    return this._crud.create(this.getJiraIssueUrl(measureId), jiraIssueInput);
  }

  getJiraIssue(measureId: number): Observable<IJiraIssue> {
    return this._crud.read(this.getJiraIssueUrl(measureId));
  }
}
