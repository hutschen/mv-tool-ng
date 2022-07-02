import { Component, Input } from '@angular/core';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-jira-project-label',
  template: `
    <span *ngIf="project">
      <span *ngIf="project.hasPermissionOnJiraProject">
        {{project.jira_project?.name}}
      </span>
      <span *ngIf="!project.hasPermissionOnJiraProject">
        <mat-icon 
          matTooltip="You have not the permission to view the JIRA project">
          block
        </mat-icon>
      </span>
    </span>
  `,
  styles: [
  ]
})
export class JiraProjectLabelComponent {
  @Input() project : Project | null = null;

  constructor() { }
}
