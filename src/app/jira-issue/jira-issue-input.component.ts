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
import { finalize, firstValueFrom } from 'rxjs';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Project } from '../shared/services/project.service';
import { JiraIssueDialogService } from './jira-issue-dialog.component';
import { JiraIssueSelectDialogService } from './jira-issue-select-dialog.component';

@Component({
  selector: 'mvtool-jira-issue-input',
  template: `
    <div *ngIf="measure && !loading">
      <!-- A Jira issue is linked -->
      <div *ngIf="measure.hasLinkedJiraIssue">
        <!-- User has permission to view Jira issue -->
        <div *ngIf="measure.jira_issue" class="indicator">
          <button
            mat-button
            [color]="measure.jira_issue.status.completed ? 'primary' : 'warn'"
            [matMenuTriggerFor]="editJiraIssueMenu"
          >
            <mat-icon *ngIf="measure.jira_issue.status.completed"
              >check
            </mat-icon>
            <mat-icon *ngIf="!measure.jira_issue.status.completed"
              >close
            </mat-icon>
            {{ measure.jira_issue.key | truncate }}
          </button>
        </div>
        <!-- User has not permission to view Jira issue -->
        <div *ngIf="!measure.jira_issue">
          <button
            mat-button
            [matMenuTriggerFor]="editJiraIssueMenu"
            matTooltip="You do not have the permission to view the JIRA issue"
          >
            <mat-icon>block</mat-icon>
            No permission
          </button>
        </div>

        <!-- Menu to edit Jira issue -->
        <mat-menu #editJiraIssueMenu="matMenu">
          <!-- item to open issue -->
          <a
            *ngIf="measure.jira_issue"
            mat-menu-item
            href="{{ measure.jira_issue.url }}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <mat-icon>open_in_new</mat-icon>
            Open issue
          </a>
          <!-- item to unlink issue -->
          <button mat-menu-item (click)="onUnlinkJiraIssue()">
            <mat-icon>link_off</mat-icon>
            Unlink issue
          </button>
        </mat-menu>
      </div>

      <!-- No Jira issue is linked -->
      <div *ngIf="!measure.hasLinkedJiraIssue">
        <!-- A Jira project exists on which the user has permissions -->
        <div *ngIf="measure.requirement.project.jira_project">
          <button mat-button [matMenuTriggerFor]="addJiraIssueMenu">
            <mat-icon>add</mat-icon>
            Add issue
          </button>
          <mat-menu #addJiraIssueMenu="matMenu">
            <button mat-menu-item (click)="onCreateJiraIssue()">
              Create issue
            </button>
            <button mat-menu-item (click)="onSelectJiraIssue()">
              Select issue
            </button>
          </mat-menu>
        </div>

        <!-- No Jira project exists on which the user has permissions -->
        <div *ngIf="!measure.requirement.project.jira_project">
          <mat-icon
            matTooltip="To this project is no JIRA project assigned or you have not the permission to view it"
            style="margin-left: 20px;"
          >
            info
          </mat-icon>
        </div>
      </div>
    </div>

    <mat-spinner
      *ngIf="loading"
      diameter="20"
      style="margin-left: 20px;"
    ></mat-spinner>
  `,
  styles: [],
})
export class JiraIssueInputComponent implements OnInit {
  @Input() measure?: Measure;
  @Output() measureChange = new EventEmitter<Measure>();
  project: Project | null = null;
  loading: boolean = false;

  constructor(
    protected _measureService: MeasureService,
    protected _jiraIssueDialogService: JiraIssueDialogService,
    protected _jiraIssueSelectDialogService: JiraIssueSelectDialogService
  ) {}

  ngOnInit(): void {
    if (this.measure) {
      this.project = this.measure.requirement.project;
    }
  }

  onCreateJiraIssue(): void {
    if (!this.measure) throw new Error('measure is undefined');

    const dialogRef = this._jiraIssueDialogService.openJiraIssueDialog(
      this.measure
    );
    dialogRef.afterClosed().subscribe((measure) => {
      if (measure) this.measureChange.emit(measure);
    });
  }

  onSelectJiraIssue(): void {
    if (!this.measure) throw new Error('measure is undefined');

    const dialogRef =
      this._jiraIssueSelectDialogService.openJiraIssueSelectDialog(
        this.measure
      );
    dialogRef.afterClosed().subscribe((measure) => {
      if (measure) this.measureChange.emit(measure);
    });
  }

  async onUnlinkJiraIssue(): Promise<void> {
    if (!this.measure) throw new Error('measure is undefined');

    // Define observable to patch measure
    const measure$ = this._measureService.patchMeasure(this.measure.id, {
      jira_issue_id: null,
    });

    // Perform patch
    this.loading = true;
    this.measure = await firstValueFrom(
      measure$.pipe(finalize(() => (this.loading = false)))
    );

    this.measureChange.emit(this.measure);
  }
}
