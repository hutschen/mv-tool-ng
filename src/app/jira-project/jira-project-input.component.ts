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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  IJiraProject,
  JiraProjectService,
} from '../shared/services/jira-project.service';

@Component({
  selector: 'mvtool-jira-project-input',
  template: `
    <div *ngIf="locked" fxLayout="row" fxLayoutAlign="space-between center">
      <div>You have not the permission to view the JIRA project.</div>
      <!-- button unlock -->
      <button
        mat-button
        (click)="unlock()"
        matTooltip="Unlock to select another JIRA project"
      >
        <mat-icon>lock_open</mat-icon>
        Unlock
      </button>
    </div>
    <div *ngIf="!locked" fxLayout="column" fxLayoutAlign="stretch">
      <mat-form-field appearance="fill">
        <mat-label>Select Jira project</mat-label>
        <mat-select name="jiraProject" [(ngModel)]="jiraProjectId_">
          <mat-option>None</mat-option>
          <mat-option
            *ngFor="let jiraProject of jiraProjects"
            [value]="jiraProject.id"
          >
            {{ jiraProject.name }} / {{ jiraProject.key }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [],
})
export class JiraProjectInputComponent implements OnInit {
  @Input() locked: boolean = true;
  @Input() jiraProjectId: string | null = null;
  @Output() jiraProjectIdChange = new EventEmitter<string | null>();
  jiraProjects: IJiraProject[] = [];

  constructor(protected _jiraProjectService: JiraProjectService) {}

  async ngOnInit() {
    if (!this.locked) {
      this.jiraProjects = await this._jiraProjectService.getJiraProjects();
    }
  }

  async unlock() {
    this.locked = false;
    this.jiraProjects = await this._jiraProjectService.getJiraProjects();
  }

  get jiraProjectId_(): string | null {
    return this.jiraProjectId;
  }

  set jiraProjectId_(jiraProjectId: string | null) {
    this.jiraProjectIdChange.emit(jiraProjectId);
  }
}
