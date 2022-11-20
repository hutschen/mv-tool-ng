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
import { firstValueFrom } from 'rxjs';
import { CRUDService } from './crud.service';
import { JiraProjectService } from './jira-project.service';

export interface IJiraIssueType {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class JiraIssueTypeService {
  constructor(
    protected _crud: CRUDService<IJiraIssueType, IJiraIssueType>,
    protected _projects: JiraProjectService
  ) {}

  getJiraIssueTypesUrl(jiraProjectId: string): string {
    return `${this._projects.getJiraProjectUrl(jiraProjectId)}/jira-issuetypes`;
  }

  async getJiraIssueTypes(jiraProjectId: string): Promise<IJiraIssueType[]> {
    const jiraIssueTypes$ = this._crud.list(
      this.getJiraIssueTypesUrl(jiraProjectId)
    );
    return firstValueFrom(jiraIssueTypes$);
  }
}
