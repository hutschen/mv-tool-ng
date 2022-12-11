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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { TableColumns } from '../shared/table-columns';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDialogService } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['../shared/styles/mat-table.css', '../shared/styles/flex.css'],
  styles: [],
})
export class ProjectTableComponent implements OnInit {
  columns = new TableColumns<Project>([
    { id: 'name', label: 'Name', auto: true },
    { id: 'description', label: 'Description', optional: true, auto: true },
    { id: 'jira_project', label: 'Jira Project' },
    {
      id: 'completion',
      label: 'Completion',
      optional: true,
      toValue: (p) => p.percentComplete,
      toStr: (p) =>
        p.percentComplete !== null
          ? `${p.percentComplete}% complete`
          : 'Nothing to be completed',
      toBool: (p) => p.percentComplete !== null,
    },
    { id: 'options' },
  ]);
  protected _dataSubject = new ReplaySubject<Project[]>(1);
  data$: Observable<Project[]> = this._dataSubject.asObservable();
  dataLoaded: boolean = false;
  @Output() projectClicked = new EventEmitter<Project>();

  constructor(
    protected _projectService: ProjectService,
    protected _projectDialogService: ProjectDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadProjects();
  }

  protected async _createOrEditProject(project?: Project): Promise<void> {
    const dialogRef = this._projectDialogService.openProjectDialog(project);
    const resultingProject = await firstValueFrom(dialogRef.afterClosed());
    if (resultingProject) {
      await this.onReloadProjects();
    }
  }

  async onCreateProject(): Promise<void> {
    await this._createOrEditProject();
  }

  async onEditProject(project: Project): Promise<void> {
    await this._createOrEditProject(project);
  }

  async onDeleteProject(project: Project): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Project',
      `Do you really want to delete project "${project.name}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._projectService.deleteProject(project.id));
      await this.onReloadProjects();
    }
  }

  async onReloadProjects(): Promise<void> {
    const data = await firstValueFrom(this._projectService.listProjects());
    this._dataSubject.next(data);
    this.dataLoaded = true;
  }
}
