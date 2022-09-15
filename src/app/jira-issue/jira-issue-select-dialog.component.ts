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
  template: ` <p>jira-issue-select-dialog works!</p> `,
  styles: [],
})
export class JiraIssueSelectDialogComponent implements OnInit {
  jiraProject: IJiraProject;
  jiraIssues: IJiraIssue[] = [];

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
}
