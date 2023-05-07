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
import { ProjectInteractionService } from '../shared/services/project-interaction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mvtool-project-details',
  template: `
    <ng-container *ngIf="project$ | async as project">
      <div class="fx-row fx-space-between-center fx-gap-5 margin-x margin-y">
        <!-- Title -->
        <h1 class="truncate no-margin">{{ project.name }}</h1>
        <div class="fx-row fx-gap-5">
          <mvtool-jira-project-label
            *ngIf="project.jira_project"
            [project]="project"
          ></mvtool-jira-project-label>
          <button
            mat-stroked-button
            (click)="projectInteractions.onEditProject(project)"
          >
            <mat-icon>edit_note</mat-icon>
            Edit Project
          </button>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: [
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
    '../shared/styles/spacing.scss',
  ],
  styles: [],
})
export class ProjectDetailsComponent {
  project$?: Observable<Project>;

  constructor(readonly projectInteractions: ProjectInteractionService) {}

  @Input()
  set project(project: Project) {
    this.project$ = this.projectInteractions.syncProject(project);
  }
}
