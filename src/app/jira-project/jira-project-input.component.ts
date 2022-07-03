import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IJiraProject, JiraProjectService } from '../shared/services/jira-project.service';

@Component({
  selector: 'mvtool-jira-project-input',
  template: `
    <div *ngIf="locked" fxLayout="row" fxLayoutAlign="space-between center">
      <div>You have not the permission to view the JIRA project.</div>
      <!-- button unlock -->
      <button mat-button
        (click)="unlock()"
        matTooltip="Unlock to select another JIRA project">
        <mat-icon>lock_open</mat-icon>
        Unlock
      </button>
    </div>
    <div *ngIf="!locked" fxLayout="column" fxLayoutAlign="stretch">
      <mat-form-field appearance="fill">
        <mat-label>Select Jira project</mat-label>
        <mat-select name="jiraProject" [(ngModel)]="jiraProjectId_">
          <mat-option>None</mat-option>
          <mat-option 
            *ngFor="let jiraProject of jiraProjects" 
            [value]="jiraProject.id">
            {{jiraProject.name}} / {{jiraProject.key}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: []
})
export class JiraProjectInputComponent implements OnInit {
  @Input() locked: boolean = true
  @Input() jiraProjectId: string | null = null;
  @Output() jiraProjectIdChange = new EventEmitter<string | null>();
  jiraProjects: IJiraProject[] = [];

  constructor(protected _jiraProjectService: JiraProjectService) { }

  async ngOnInit(){
    if (!this.locked) {
      this.jiraProjects = await this._jiraProjectService.getJiraProjects();
    }
  }

  async unlock() {
    this.locked = false;
    this.jiraProjects = await this._jiraProjectService.getJiraProjects();
  }

  get jiraProjectId_(): string | null {
    return this.jiraProjectId;
  }

  set jiraProjectId_(jiraProjectId: string | null) {
    this.jiraProjectIdChange.emit(jiraProjectId);
  }
}
