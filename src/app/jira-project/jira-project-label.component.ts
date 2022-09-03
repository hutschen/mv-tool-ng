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

import { Component, Input } from '@angular/core';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-jira-project-label',
  template: `
    <span *ngIf="project">
      <span *ngIf="project.hasPermissionOnJiraProject && project.jira_project">
        <a
          mat-button
          href="{{ project.jira_project.url }}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <mat-icon>open_in_new</mat-icon>
          {{ project.jira_project.key | truncate }} /
          {{ project.jira_project.name | truncate }}
        </a>
      </span>
      <span *ngIf="!project.hasPermissionOnJiraProject">
        <mat-icon
          matTooltip="You have not the permission to view the JIRA project"
        >
          block
        </mat-icon>
      </span>
    </span>
  `,
  styles: [],
})
export class JiraProjectLabelComponent {
  @Input() project: Project | null = null;

  constructor() {}
}
