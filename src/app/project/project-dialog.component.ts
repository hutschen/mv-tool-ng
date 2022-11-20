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

import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Project,
  IProjectInput,
  ProjectService,
} from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['../shared/styles/flex.css'],
  styles: ['textarea { min-height: 100px; }'],
})
export class ProjectDialogComponent {
  projectInput: IProjectInput = {
    name: '',
    description: null,
    jira_project_id: null,
  };

  constructor(
    protected _dialogRef: MatDialogRef<ProjectDialogComponent>,
    protected _projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA) protected _project: Project | null
  ) {
    if (this._project) {
      this.projectInput = this._project.toProjectInput();
    }
  }

  get createMode(): boolean {
    return !this._project;
  }

  get jiraProjectLocked(): boolean {
    if (this.createMode) {
      return false;
    } else {
      return !this._project?.hasPermissionOnJiraProject;
    }
  }

  async onSave(form: NgForm): Promise<void> {
    if (form.valid) {
      let project: Project;
      if (!this._project) {
        project = await this._projectService.createProject_legacy(
          this.projectInput
        );
      } else {
        project = await this._projectService.updateProject_legacy(
          this._project.id,
          this.projectInput
        );
      }
      this._dialogRef.close(project);
    }
  }
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
