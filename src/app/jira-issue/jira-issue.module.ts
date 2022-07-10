import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JiraIssueInputComponent } from './jira-issue-input.component';
import { JiraIssueLabelComponent } from './jira-issue-label.component';



@NgModule({
  declarations: [
    JiraIssueInputComponent,
    JiraIssueLabelComponent
  ],
  imports: [
    CommonModule
  ]
})
export class JiraIssueModule { }
