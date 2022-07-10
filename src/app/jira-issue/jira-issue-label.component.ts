import { Component, Input } from '@angular/core';
import { IJiraIssue } from '../shared/services/jira-issue.service';
import { Measure } from '../shared/services/measure.service';
import { Project, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-jira-issue-label',
  template: `
    <span *ngIf="measure_ && project">
      <span *ngIf="project.hasPermissionOnJiraProject && measure_.jira_issue">
        <a mat-button
          href="{{measure_.jira_issue.url}}" 
          target="_blank" rel="noopener noreferrer">
          <mat-icon>open_in_new</mat-icon>
          {{measure_.jira_issue.key | truncate }} / 
          {{measure_.jira_issue.summary | truncate }}
          <mat-icon *ngIf="measure_.jira_issue.status.completed">check</mat-icon>
          <mat-icon *ngIf="!measure_.jira_issue.status.completed">close</mat-icon>
        </a>
      </span>
      <span *ngIf="!project.hasPermissionOnJiraProject">
        <mat-icon 
          matTooltip="You have not the permission to view the JIRA project">
          block
        </mat-icon>
      </span>
    </span>
  `,
  styles: []
})
export class JiraIssueLabelComponent {
  project: Project | null = null;
  measure_: Measure | null = null;

  constructor(protected _projectService: ProjectService) { }

  @Input() 
  set measure(measure: Measure | null) {
    this.measure_ = measure;
    this.reload();
  }

  async reload(): Promise<void> {
    if (this.measure_) {
      // reload project because it is possibly incomplete
      this.project = await this._projectService.getProject(
        this.measure_.requirement.project.id);
    }
  }

}
