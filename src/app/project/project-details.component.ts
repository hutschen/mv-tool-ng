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
import { MatDialog } from '@angular/material/dialog';
import { Project } from '../shared/services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-details',
  template: `
    <div class="project-card fx-column fx-gap-15" *ngIf="project">
      <!-- Title -->
      <div class="fx-row fx-space-between-center fx-gap-5">
        <h1 class="truncate">{{ project.name }}</h1>
        <div class="fx-row fx-gap-5">
          <mvtool-jira-project-label
            *ngIf="project.jira_project"
            [project]="project"
          ></mvtool-jira-project-label>
          <button mat-stroked-button (click)="onEditProject()">
            <mat-icon>edit_note</mat-icon>
            Edit Project
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.css'],
  styles: ['h1 { margin: 0; }', '.project-card { margin: 20px; }'],
})
export class ProjectDetailsComponent {
  @Input() project: Project | null = null;

  constructor(protected _dialog: MatDialog) {}

  onEditProject() {
    const dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: this.project,
    });
    dialogRef.afterClosed().subscribe((project: Project | null) => {
      if (project) {
        this.project = project;
      }
    });
  }
}
