import { Component, Input } from '@angular/core';
import { Measure } from '../shared/services/measure.service';

@Component({
  selector: 'mvtool-jira-issue-label',
  template: `
    <span *ngIf="measure">
      <span *ngIf="measure.hasPermissionOnJiraIssue && measure.jira_issue">
        <a mat-button
          href="{{measure.jira_issue.url}}" 
          target="_blank" rel="noopener noreferrer">
          <mat-icon>open_in_new</mat-icon>
          {{measure.jira_issue.key | truncate }}
          <mat-icon *ngIf="measure.jira_issue.status.completed">check</mat-icon>
          <mat-icon *ngIf="!measure.jira_issue.status.completed">close</mat-icon>
        </a>
      </span>
      <span *ngIf="!measure.hasPermissionOnJiraIssue">
        <mat-icon 
          matTooltip="You have not the permission to view the JIRA issue">
          block
        </mat-icon>
      </span>
    </span>
  `,
  styles: []
})
export class JiraIssueLabelComponent {
  @Input() measure: Measure | null = null;

  constructor() { }
}
