import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IJiraProject, JiraProjectService } from '../shared/services/jira-project.service';
import { IProject, IProjectInput, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.css']
})
export class ProjectDialogComponent implements OnInit {
  jiraProjects: IJiraProject[] = [];
  projectInput: IProjectInput = {
    name: '',
    description: '',
    jira_project_id: null,
  }

  constructor(
    protected _dialogRef: MatDialogRef<ProjectDialogComponent>, 
    protected _projectService: ProjectService,
    protected _jiraProjectService: JiraProjectService,
    @Inject(MAT_DIALOG_DATA) protected _project: IProject | null) { }

  onSave(): void {
    this._dialogRef.close(this.projectInput);
  }
  onCancel(): void {
    this._dialogRef.close(null);
  }

  get createMode(): boolean {
    return this._project === null;
  }

  async ngOnInit() {
    if (this._project) {
      this.projectInput = {
        name: this._project.name,
        description: this._project.description,
        jira_project_id: this._project.jira_project_id,
      }
    } else {
      this.projectInput = {
        name: '',
        description: '',
        jira_project_id: null,
      }
    }

    if (!this.projectInput.jira_project_id) {
      this.jiraProjects = await this._jiraProjectService.getJiraProjects();
    }
  }

}
