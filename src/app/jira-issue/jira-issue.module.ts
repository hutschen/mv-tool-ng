import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JiraIssueInputComponent } from './jira-issue-input.component';
import { JiraIssueLabelComponent } from './jira-issue-label.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { JiraIssueDialogComponent } from './jira-issue-dialog.component';



@NgModule({
  declarations: [
    JiraIssueInputComponent,
    JiraIssueLabelComponent,
    JiraIssueDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
  ],
  exports: [
    JiraIssueInputComponent,
    JiraIssueLabelComponent,
  ]
})
export class JiraIssueModule { }
