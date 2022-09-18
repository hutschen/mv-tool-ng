import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  IJiraIssue,
  JiraIssueService,
} from '../shared/services/jira-issue.service';
import { IJiraProject } from '../shared/services/jira-project.service';

export interface IJiraIssueSelectDialogData {
  jiraProject: IJiraProject;
}

@Component({
  selector: 'mvtool-jira-issue-select-dialog',
  template: `
    <div fxLayout="column">
      <mat-form-field appearance="fill">
        <mat-label>Issue</mat-label>
        <input
          type="text"
          matInput
          [(ngModel)]="filterValue"
          [matAutocomplete]="issueAutocomplete"
        />
        <mat-autocomplete #issueAutocomplete="matAutocomplete">
          <mat-option
            *ngFor="let issue of filteredJiraIssues"
            [value]="issue.key"
          >
            {{ issue.key }}: {{ issue.summary }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styles: [],
})
export class JiraIssueSelectDialogComponent implements OnInit {
  jiraProject: IJiraProject;
  jiraIssue: IJiraIssue | null = null;
  jiraIssues: IJiraIssue[] = [];
  filterValue: string | null = null;

  constructor(
    protected _jiraIssueService: JiraIssueService,
    protected _dialogRef: MatDialogRef<JiraIssueSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IJiraIssueSelectDialogData
  ) {
    this.jiraProject = dialogData.jiraProject;
  }

  async ngOnInit(): Promise<void> {
    this.jiraIssues = await this._jiraIssueService.getJiraIssues(
      this.jiraProject.id
    );
  }

  get filteredJiraIssues(): IJiraIssue[] {
    if (!this.filterValue) {
      return [];
    }

    const filterValue = this.filterValue.toLowerCase();
    return this.jiraIssues.filter((issue) =>
      `${issue.key}: ${issue.summary}`.toLowerCase().includes(filterValue)
    );
  }
}
