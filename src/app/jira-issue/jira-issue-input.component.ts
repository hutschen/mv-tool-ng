import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IJiraIssueInput } from '../shared/services/jira-issue.service';
import { IMeasureInput } from '../shared/services/measure.service';
import { Project, ProjectService } from '../shared/services/project.service';
import { JiraIssueDialogComponent } from './jira-issue-dialog.component';

@Component({
  selector: 'mvtool-jira-issue-input',
  template: `
    <span *ngIf="project?.hasPermissionOnJiraProject && project?.hasJiraProject">
      <!-- Button to create jira issue -->
      <button mat-button (click)="onCreateJiraIssue()">
        <mat-icon>add</mat-icon>
        Create JIRA Issue
      </button>
    </span>
  `,
  styles: [
  ]
})
export class JiraIssueInputComponent implements OnInit {
  @Input() projectId: number | null = null;
  @Input() measureInput: IMeasureInput | null = null;
  @Output() onJiraIssueInput = new EventEmitter<IJiraIssueInput>();
  project: Project | null = null;

  constructor(
    protected _projectService: ProjectService,
    protected _dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    if(this.projectId) {
      this.project = await this._projectService.getProject(this.projectId);
    }
  }

  onCreateJiraIssue(): void {
    let dialogRef = this._dialog.open(JiraIssueDialogComponent, {
      width: '500px',
      data: {
        jiraProjectId: this.project?.jira_project_id,
        measureInput: this.measureInput
      }
    })
    dialogRef.afterClosed().subscribe(jiraIssueInput => {
      if (jiraIssueInput) {
        this.onJiraIssueInput.emit(jiraIssueInput);
      }
    })
  }
}
