import { Component, Inject, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IJiraProject, JiraProjectService } from '../shared/services/jira-project.service';
import { Project, IProjectInput, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.css']
})
export class ProjectDialogComponent implements OnInit {
  projectInput: IProjectInput = {
    name: '',
    description: null,
    jira_project_id: null,
  }

  constructor(
    protected _dialogRef: MatDialogRef<ProjectDialogComponent>, 
    protected _projectService: ProjectService,
    protected _jiraProjectService: JiraProjectService,
    @Inject(MAT_DIALOG_DATA) protected _project: Project | null) { }

  ngOnInit() {
    if (this._project) {
      this.projectInput = {
        name: this._project.name,
        description: this._project.description,
        jira_project_id: this._project.jira_project_id,
      }
    }
  }

  get createMode(): boolean {
    return this._project === null;
  }

  get jiraProjectLocked(): boolean {
    if (this.createMode) {
      return false;
    } else {
      return !this._project?.hasPermissionOnJiraProject;
    }
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._dialogRef.close(this.projectInput);
    }
  }
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
