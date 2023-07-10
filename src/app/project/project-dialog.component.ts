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

import { Component, Inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable, finalize, firstValueFrom } from 'rxjs';
import {
  Project,
  IProjectInput,
  ProjectService,
} from '../shared/services/project.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDialogService {
  constructor(protected _dialog: MatDialog) {}

  openProjectDialog(
    project?: Project
  ): MatDialogRef<ProjectDialogComponent, Project> {
    return this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project,
    });
  }
}

@Component({
  selector: 'mvtool-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class ProjectDialogComponent {
  projectInput: IProjectInput = {
    name: '',
  };
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<ProjectDialogComponent>,
    protected _projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA) protected _project?: Project
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

  async onSave(form: NgForm) {
    if (form.valid) {
      // Define observable to create or update project
      let project$: Observable<Project>;
      if (!this._project) {
        project$ = this._projectService.createProject(this.projectInput);
      } else {
        project$ = this._projectService.updateProject(
          this._project.id,
          this.projectInput
        );
      }

      // Perform action and close dialog
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          project$.pipe(
            finalize(() => {
              this.isSaving = false;
              this._dialogRef.disableClose = false;
            })
          )
        )
      );
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
