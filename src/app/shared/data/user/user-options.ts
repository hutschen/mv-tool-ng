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
import { UserService } from '../../services/user.service';
import { IJiraProject } from '../../services/jira-project.service';

export class UserOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _userService: UserService,
    protected _jiraProject: IJiraProject,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  override getOptions(...userIds: string[]): Observable<IOption[]> {
    if (!userIds.length) return of([]);
    return this._userService.getSpecificUsers(...userIds).pipe(
      map((users) =>
        users.map((user) => ({
          value: user.id,
          label: user.display_name,
        }))
      )
    );
  }

  override filterOptions(
    filter?: string | null | undefined,
    limit?: number | undefined
  ): Observable<IOption[]> {
    if (!filter) return of([]);
    return this._userService
      .searchUsers(
        this._jiraProject.id,
        filter,
        limit && limit > 0 ? { limit } : {}
      )
      .pipe(
        map((users) =>
          users.map((user) => ({
            value: user.id,
            label: user.display_name,
          }))
        )
      );
  }
}
