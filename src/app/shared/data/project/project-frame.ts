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

import { map } from 'rxjs';
import { Project, ProjectService } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import {
  CompletionColumn,
  DescriptionColumn,
  NameColumn,
  VerificationColumn,
} from '../custom/custom-colums';
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import { FilterForExistence, Filters } from '../filter';
import { JiraProjectField } from './project-fields';

export class ProjectDataFrame extends DataFrame<Project> {
  constructor(
    protected _projectService: ProjectService,
    initQueryParams: IQueryParams = {}
  ) {
    const jiraProjectColumn = new DataColumn(
      new JiraProjectField(false),
      new Filters(
        'Jira Projects',
        undefined,
        undefined,
        new FilterForExistence('has_jira_project', initQueryParams)
      ),
      initQueryParams
    );

    super(
      [
        new NameColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        jiraProjectColumn,
        new CompletionColumn(initQueryParams),
        new VerificationColumn(initQueryParams),
        new PlaceholderColumn('options'),
      ],
      initQueryParams
    );
    this.reload();
  }

  override getColumnNames() {
    return this._projectService.getProjectFieldNames();
  }

  override getData(queryParams: IQueryParams) {
    return this._projectService.queryProjects(queryParams);
  }
}
