import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IJiraIssueType, JiraIssueTypeService } from '../shared/services/jira-issue-type.service';
import { IJiraIssueInput } from '../shared/services/jira-issue.service';
import { IMeasureInput } from '../shared/services/measure.service';

export interface JiraIssueDialogData {
  jiraProjectId: string;
  measureInput: IMeasureInput;
}

@Component({
  selector: 'mvtool-jira-issue-dialog',
  templateUrl: './jira-issue-dialog.component.html',
  styles: [
    'textarea { min-height: 100px; }'
  ]
})
export class JiraIssueDialogComponent implements OnInit {
  jiraProjectId: string;
  jiraIssueTypes: IJiraIssueType[] = [];
  jiraIssueInput: IJiraIssueInput = {
    summary: '',
    description: null,
    issuetype_id: ''
  }

  constructor(
    protected _jiraIssueTypeService: JiraIssueTypeService,
    protected _dialogRef: MatDialogRef<JiraIssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: JiraIssueDialogData) {
    this.jiraProjectId = this._dialogData.jiraProjectId;
    this.jiraIssueInput.summary = this._dialogData.measureInput.summary;
    this.jiraIssueInput.description = this._dialogData.measureInput.description;
  }

  async ngOnInit(): Promise<void> {
    this.jiraIssueTypes = await this._jiraIssueTypeService.getJiraIssueTypes(
      this.jiraProjectId);
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
