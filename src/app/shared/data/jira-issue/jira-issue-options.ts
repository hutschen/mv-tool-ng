// Copyright (C) 2023 Helmar Hutschenreuter
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

import { Observable, map, of } from 'rxjs';
import { IOption, Options } from '../options';
import { JiraIssueService } from '../../services/jira-issue.service';
import { IJiraProject } from '../../services/jira-project.service';
import { IQueryParams } from '../../services/query-params.service';

export class JiraIssueOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _jiraIssueService: JiraIssueService,
    protected _jiraProject: IJiraProject,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Retrieve Jira issues and convert them to filter options
    return this._jiraIssueService
      .queryJiraIssues({
        jira_project_ids: this._jiraProject.id,
        ...queryParams,
      })
      .pipe(
        map((jiraIssues) => {
          if (!Array.isArray(jiraIssues)) jiraIssues = jiraIssues.items;
          return jiraIssues.map((ji) => ({
            value: ji.id,
            label: `${ji.key}: ${ji.summary}`,
          }));
        })
      );
  }

  override getOptions(...ids: string[]): Observable<IOption[]> {
    if (!ids.length) return of([]);
    return this.__loadOptions({ ids });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to retrieve Jira issues
    const queryParams: IQueryParams = {};
    if (filter) queryParams['search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }
    return this.__loadOptions(queryParams);
  }
}
