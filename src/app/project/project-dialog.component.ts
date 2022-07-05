import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project, IProjectInput } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.css']
})
export class ProjectDialogComponent {
  projectInput: IProjectInput = {
    name: '',
    description: null,
    jira_project_id: null,
  }

  constructor(
    protected _dialogRef: MatDialogRef<ProjectDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) protected _project: Project | null) {
      if (this._project) {
        this.projectInput = this._project.toProjectInput();
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
