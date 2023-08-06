import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  IJiraIssue,
  JiraIssueService,
} from '../shared/services/jira-issue.service';
import { IJiraProject } from '../shared/services/jira-project.service';
import { map } from 'rxjs';
import { JiraIssueOptions } from '../shared/data/jira-issue/jira-issue-options';

export interface IJiraIssueSelectDialogData {
  jiraProject: IJiraProject;
}

@Injectable({
  providedIn: 'root',
})
export class JiraIssueSelectDialogService {
  constructor(protected _dialog: MatDialog) {}

  openJiraIssueSelectDialog(
    jiraProject: IJiraProject
  ): MatDialogRef<JiraIssueSelectDialogComponent, IJiraIssue> {
    return this._dialog.open(JiraIssueSelectDialogComponent, {
      width: '500px',
      data: { jiraProject },
    });
  }
}

@Component({
  selector: 'mvtool-jira-issue-select-dialog',
  template: `
    <!-- Title -->
    <div mat-dialog-title>Select JIRA Issue</div>

    <!-- Content -->
    <div mat-dialog-content>
      <form
        id="jiraIssueSelectForm"
        #jiraIssueSelectForm="ngForm"
        (submit)="onSubmit(jiraIssueSelectForm)"
        class="fx-column"
      >
        <mvtool-options-input
          name="jira_issue_id"
          label="JIRA Issue"
          placeholder="Select JIRA Issue"
          [options]="jiraIssueOptions"
          [(ngModel)]="filterValue"
        ></mvtool-options-input>
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
        Save
      </button>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['.loading-spinner { margin-right: 8px; }'],
})
export class JiraIssueSelectDialogComponent implements OnInit {
  jiraProject: IJiraProject;
  jiraIssues: IJiraIssue[] = [];
  filterValue: string | null = null;
  jiraIssuesLoaded: boolean = false;
  jiraIssueOptions: JiraIssueOptions;

  constructor(
    protected _jiraIssueService: JiraIssueService,
    protected _dialogRef: MatDialogRef<JiraIssueSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IJiraIssueSelectDialogData
  ) {
    this.jiraProject = dialogData.jiraProject;
    this.jiraIssueOptions = new JiraIssueOptions(
      this._jiraIssueService,
      this.jiraProject,
      false
    );
  }

  ngOnInit(): void {
    this._jiraIssueService
      .queryJiraIssues({ project_ids: this.jiraProject.id })
      .pipe(map((jiraIssues) => jiraIssues as IJiraIssue[]))
      .subscribe((jiraIssues) => {
        this.jiraIssues = jiraIssues;
        this.jiraIssuesLoaded = true;
      });
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

  get jiraIssue(): IJiraIssue | undefined {
    if (!this.filterValue) {
      return undefined;
    }
    return this.jiraIssues.find((issue) => issue.id === this.filterValue);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      if (this.jiraIssue) {
        this._dialogRef.close(this.jiraIssue);
      } else {
        form.controls['jiraIssueKey'].setErrors({ invalid: true });
      }
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
