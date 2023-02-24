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

import { IJiraProject } from '../../services/jira-project.service';
import { Project } from '../../services/project.service';
import { DataField } from '../data';

export class JiraProjectField extends DataField<Project, IJiraProject | null> {
  constructor(optional: boolean = true) {
    super('jira_project', null, optional);
  }

  override toStr(data: Project): string {
    if (data.jira_project) {
      return `${data.jira_project.key} / ${data.jira_project.name}`;
    } else if (data.jira_project_id) {
      return 'No permission on Jira project';
    } else {
      return 'No Jira project assigned';
    }
  }
}
