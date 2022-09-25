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
  selector: 'mvtool-project-card',
  template: `
    <div
      class="project-card"
      *ngIf="project"
      fxLayout="column"
      fxLayoutGap="15px"
    >
      <!-- Title -->
      <div
        fxLayout="row"
        fxLayoutAlign="space-between center"
        fxLayoutGap="5px"
      >
        <h1 class="truncate">{{ project.name }}</h1>
        <div fxLayout="row" fxLayoutGap="5px">
          <mvtool-jira-project-label
            *ngIf="project.jira_project"
            [project]="project"
          ></mvtool-jira-project-label>
          <button mat-stroked-button>
            <mat-icon>edit_note</mat-icon>
            Edit Project
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ['h1 { margin: 0; }', '.project-card { margin: 20px; }'],
})
export class ProjectCardComponent {
  @Input() project: Project | null = null;

  constructor() {}
}
