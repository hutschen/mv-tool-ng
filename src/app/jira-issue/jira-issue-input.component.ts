import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  IJiraIssue,
  JiraIssueService,
} from '../shared/services/jira-issue.service';
import { IMeasureInput, Measure } from '../shared/services/measure.service';
import { Project, ProjectService } from '../shared/services/project.service';
import {
  IJiraIssueDialogData,
  JiraIssueDialogComponent,
} from './jira-issue-dialog.component';

@Component({
  selector: 'mvtool-jira-issue-input',
  template: `
    <div *ngIf="measure" fxLayout="row" fxLayoutAlign="center">
      <!-- A Jira issue is linked -->
      <div *ngIf="measure.hasLinkedJiraIssue">
        <mvtool-jira-issue-label [measure]="measure"></mvtool-jira-issue-label>
      </div>

      <!-- No Jira issue is linked -->
      <div *ngIf="!measure.hasLinkedJiraIssue">
        <!-- A Jira project exists on which the user has permissions -->
        <div *ngIf="measure.requirement.project.jira_project">
          <button *ngIf="!loading" mat-button (click)="onCreateJiraIssue()">
            <mat-icon>add</mat-icon>
            Create JIRA Issue
          </button>
          <mat-spinner
            *ngIf="loading"
            color="accent"
            diameter="20"
          ></mat-spinner>
        </div>

        <!-- No Jira project exists on which the user has permissions -->
        <div *ngIf="!measure.requirement.project.jira_project">
          <mat-icon
            matTooltip="To this project is no JIRA project assigned or you have not the permission to view it"
          >
            info
          </mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class JiraIssueInputComponent implements OnInit {
  @Input() measure: Measure | null = null;
  @Output() jiraIssueCreated = new EventEmitter<IJiraIssue>();
  project: Project | null = null;
  loading: boolean = false;

  constructor(
    protected _jiraIssueService: JiraIssueService,
    protected _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.measure) {
      this.project = this.measure.requirement.project;
    }
  }

  onCreateJiraIssue(): void {
    let dialogRef = this._dialog.open(JiraIssueDialogComponent, {
      width: '500px',
      data: {
        jiraProject: this.project?.jira_project,
        measure: this.measure,
      } as IJiraIssueDialogData,
    });
    dialogRef.afterClosed().subscribe(async (jiraIssueInput) => {
      if (jiraIssueInput && this.measure) {
        this.loading = true;
        const jiraIssue = await this._jiraIssueService.createJiraIssue(
          this.measure.id,
          jiraIssueInput
        );
        this.jiraIssueCreated.emit(jiraIssue);
      }
    });
  }
}
