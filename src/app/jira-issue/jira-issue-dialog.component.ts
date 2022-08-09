import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  IJiraIssueType,
  JiraIssueTypeService,
} from '../shared/services/jira-issue-type.service';
import { IJiraIssueInput } from '../shared/services/jira-issue.service';
import { IJiraProject } from '../shared/services/jira-project.service';
import { Measure } from '../shared/services/measure.service';

export interface IJiraIssueDialogData {
  jiraProject: IJiraProject;
  measure: Measure;
}

@Component({
  selector: 'mvtool-jira-issue-dialog',
  templateUrl: './jira-issue-dialog.component.html',
  styles: ['textarea { min-height: 100px; }'],
})
export class JiraIssueDialogComponent implements OnInit {
  jiraProject: IJiraProject;
  jiraIssueTypes: IJiraIssueType[] = [];
  jiraIssueInput: IJiraIssueInput = {
    summary: '',
    description: null,
    issuetype_id: '',
  };

  constructor(
    protected _jiraIssueTypeService: JiraIssueTypeService,
    protected _dialogRef: MatDialogRef<JiraIssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IJiraIssueDialogData
  ) {
    this.jiraProject = this._dialogData.jiraProject;
    this.jiraIssueInput.summary = this._dialogData.measure.summary;
    this.jiraIssueInput.description = this._dialogData.measure.description;
  }

  async ngOnInit(): Promise<void> {
    this.jiraIssueTypes = await this._jiraIssueTypeService.getJiraIssueTypes(
      this.jiraProject.id
    );
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._dialogRef.close(this.jiraIssueInput);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
