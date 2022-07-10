import { Component, Input } from '@angular/core';
import { Measure } from '../shared/services/measure.service';

@Component({
  selector: 'mvtool-jira-issue-input',
  template: `
    <div>
      <button mat-button>
        <mat-icon>add</mat-icon>
        Create JIRA issue
      </button>
    </div>
  `,
  styles: [
  ]
})
export class JiraIssueInputComponent {
  @Input() measure: Measure | null = null

  constructor() { }

  createJiraIssue(): void {

  }
}
