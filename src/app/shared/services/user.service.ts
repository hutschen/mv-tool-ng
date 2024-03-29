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
import { JiraProjectService } from './jira-project.service';
import { IQueryParams } from './query-params.service';

export interface IUser {
  id: string;
  display_name: string;
  email_address: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    protected _crud: CRUDService<IUser, IUser>,
    protected _jiraProjects: JiraProjectService
  ) {}

  getSearchUsersUrl(jiraProjectId: string): string {
    return `${this._jiraProjects.getJiraProjectUrl(jiraProjectId)}/jira-users`;
  }

  getUsersUrl(): string {
    return 'jira-users';
  }

  getUserUrl(): string {
    return 'jira-user';
  }

  getUser(): Observable<IUser> {
    return this._crud.read(this.getUserUrl());
  }

  searchUsers(
    jiraProjectId: string,
    search: string,
    params: IQueryParams = {}
  ): Observable<IUser[]> {
    return this._crud.query(this.getSearchUsersUrl(jiraProjectId), {
      search,
      ...params,
    } as IQueryParams) as Observable<IUser[]>;
  }

  getSpecificUsers(...userIds: string[]): Observable<IUser[]> {
    return this._crud.query(this.getUsersUrl(), {
      ids: userIds,
    } as IQueryParams) as Observable<IUser[]>;
  }
}
