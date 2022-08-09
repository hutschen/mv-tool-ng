import { Component, Input } from '@angular/core';
import { Measure } from '../shared/services/measure.service';

@Component({
  selector: 'mvtool-jira-issue-label',
  template: `
    <div *ngIf="measure">
      <!-- A Jira issue is linked -->
      <div *ngIf="measure.hasLinkedJiraIssue">
        <!-- Has permission to view Jira issue -->
        <div *ngIf="measure.jira_issue">
          <a
            mat-button
            href="{{ measure.jira_issue.url }}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <mat-icon>open_in_new</mat-icon>
            {{ measure.jira_issue.key | truncate }}
            <mat-icon *ngIf="measure.jira_issue.status.completed"
              >check</mat-icon
            >
            <mat-icon *ngIf="!measure.jira_issue.status.completed"
              >close</mat-icon
            >
          </a>
        </div>

        <!-- Has not the permission to view Jira issue -->
        <div *ngIf="!measure.jira_issue">
          <mat-icon
            matTooltip="You have not the permission to view the JIRA issue"
          >
            block
          </mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class JiraIssueLabelComponent {
  @Input() measure: Measure | null = null;

  constructor() {}
}
