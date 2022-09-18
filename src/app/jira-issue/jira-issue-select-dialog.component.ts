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
    <!-- Title -->
    <div mat-dialog-title>
      <h1><span>Select JIRA Issue</span></h1>
    </div>

    <!-- Content -->
    <div mat-dialog-content>
      <form
        id="jiraIssueSelectForm"
        #jiraIssueSelectForm="ngForm"
        (submit)="onSubmit(jiraIssueSelectForm)"
        fxLayout="column"
      >
        <mat-form-field appearance="fill">
          <mat-label>Issue</mat-label>
          <input
            name="jiraIssueKey"
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
          <mat-spinner
            *ngIf="!jiraIssuesLoaded"
            matSuffix
            diameter="20"
          ></mat-spinner>
        </mat-form-field>
      </form>
    </div>

    <!-- Actions -->
    <div mat-dialog-actions align="end">
      <button mat-button class="form-button" (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
        Cancel
      </button>
      <button
        [disabled]="jiraIssueSelectForm.invalid"
        mat-raised-button
        class="form-button"
        color="accent"
        type="submit"
        form="jiraIssueSelectForm"
      >
        <mat-icon>save</mat-icon>
        Create
      </button>
    </div>
  `,
  styles: [],
})
export class JiraIssueSelectDialogComponent implements OnInit {
  jiraProject: IJiraProject;
  jiraIssue: IJiraIssue | null = null;
  jiraIssues: IJiraIssue[] = [];
  filterValue: string | null = null;
  jiraIssuesLoaded: boolean = false;

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
    this.jiraIssuesLoaded = true;
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

  onCancel(): void {}
  onSubmit(form: any): void {}
}
