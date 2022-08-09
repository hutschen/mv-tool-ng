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
    <div *ngIf="measure && !loading">
      <!-- A Jira issue is linked -->
      <div *ngIf="measure.hasLinkedJiraIssue">
        <!-- User has permission to view Jira issue -->
        <div *ngIf="measure.jira_issue">
          <button mat-button [matMenuTriggerFor]="jiraIssueMenu">
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
            [matMenuTriggerFor]="jiraIssueMenu"
            matTooltip="You do not have the permission to view the JIRA issue"
          >
            <mat-icon>block</mat-icon>
            No permission
          </button>
        </div>

        <!-- Menu for Jira issue -->
        <mat-menu #jiraIssueMenu="matMenu">
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
          <button mat-button (click)="onCreateJiraIssue()">
            <mat-icon>add</mat-icon>
            Create issue
          </button>
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

    <mat-spinner
      *ngIf="loading"
      diameter="20"
      style="margin-left: 20px;"
    ></mat-spinner>
  `,
  styles: [],
})
export class JiraIssueInputComponent implements OnInit {
  @Input() measure: Measure | null = null;
  @Output() jiraIssueChange = new EventEmitter<IJiraIssue | null>();
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
        this.jiraIssueChange.emit(jiraIssue);
      }
    });
  }

  async onUnlinkJiraIssue(): Promise<void> {
    if (this.measure) {
      this.measure.jira_issue = null;
      this.measure.jira_issue_id = null;
      this.loading = true;
      await this._jiraIssueService.unlinkJiraIssue(this.measure.id);
      this.jiraIssueChange.emit(null);
    }
  }
}
