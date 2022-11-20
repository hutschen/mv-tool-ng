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

export interface IJiraProject {
  id: string;
  key: string;
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class JiraProjectService {
  constructor(protected _crud: CRUDService<IJiraProject, IJiraProject>) {}

  getJiraProjectsUrl(): string {
    return 'jira-projects';
  }

  getJiraProjectUrl(jiraProjectId: string) {
    return `${this.getJiraProjectsUrl()}/${jiraProjectId}`;
  }

  async getJiraProjects(): Promise<IJiraProject[]> {
    return this._crud.list_legacy(this.getJiraProjectsUrl());
  }

  async getJiraProject(jiraProjectId: string): Promise<IJiraProject> {
    return this._crud.read_legacy(this.getJiraProjectUrl(jiraProjectId));
  }
}
