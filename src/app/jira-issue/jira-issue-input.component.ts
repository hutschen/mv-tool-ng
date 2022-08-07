import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  IJiraIssue,
  JiraIssueService,
} from '../shared/services/jira-issue.service';
import { IMeasureInput } from '../shared/services/measure.service';
import { Project, ProjectService } from '../shared/services/project.service';
import { JiraIssueDialogComponent } from './jira-issue-dialog.component';

@Component({
  selector: 'mvtool-jira-issue-input',
  template: `
    <span *ngIf="project && !loading">
      <span *ngIf="project.hasPermissionOnJiraProject">
        <!-- Button to create jira issue -->
        <span *ngIf="project.hasJiraProject">
          <button mat-button (click)="onCreateJiraIssue()">
            <mat-icon>add</mat-icon>
            Create JIRA Issue
          </button>
        </span>
        <span *ngIf="!project.hasJiraProject">
          <mat-icon matTooltip="To this project is no JIRA project assigned">
            info
          </mat-icon>
        </span>
      </span>
      <span *ngIf="!project.hasPermissionOnJiraProject">
        <mat-icon
          matTooltip="You have not the permission to create issues on the JIRA project"
        >
          block
        </mat-icon>
      </span>
    </span>
    <div fxLayout="column" fxLayoutAlign="center center">
      <mat-spinner color="accent" diameter="20" *ngIf="loading"></mat-spinner>
    </div>
  `,
  styles: [],
})
export class JiraIssueInputComponent implements OnInit {
  @Input() projectId: number | null = null;
  @Input() measureInput: IMeasureInput | null = null;
  @Output() jiraIssueCreated = new EventEmitter<IJiraIssue>();
  project: Project | null = null;
  loading: boolean = false;

  constructor(
    protected _projectService: ProjectService,
    protected _jiraIssueService: JiraIssueService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.projectId) {
      this.project = await this._projectService.getProject(this.projectId);
    }
  }

  onCreateJiraIssue(): void {
    let dialogRef = this._dialog.open(JiraIssueDialogComponent, {
      width: '500px',
      data: {
        jiraProjectId: this.project?.jira_project_id,
        measureInput: this.measureInput,
      },
    });
    dialogRef.afterClosed().subscribe(async (jiraIssueInput) => {
      if (jiraIssueInput && this.project?.jira_project_id) {
        this.loading = true;
        const jiraIssue = await this._jiraIssueService.createJiraIssue(
          this.project.jira_project_id,
          jiraIssueInput
        );
        this.jiraIssueCreated.emit(jiraIssue);
      }
    });
  }
}
