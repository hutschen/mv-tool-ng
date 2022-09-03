// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
    this.jiraIssueInput.description = this._generateDescription(
      this._dialogData.measure
    );
  }

  protected _generateDescription(measure: Measure): string {
    const requirement = measure.requirement;
    let description = '';

    if (requirement.reference) {
      description += `Requirement reference: ${requirement.reference}\n`;
    }
    description += `Requirement summary: ${requirement.summary}\n`;
    if (measure.description) {
      description += `\nMeasure description: ${measure.description}\n`;
    }
    return description;
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
