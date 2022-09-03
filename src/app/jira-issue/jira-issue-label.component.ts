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
