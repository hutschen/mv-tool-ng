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
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDialogService } from './project-dialog.component';
import { ProjectDataFrame } from '../shared/data/project/project-frame';
import { QueryParamsService } from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['../shared/styles/table.scss', '../shared/styles/flex.scss'],
  styles: [],
})
export class ProjectTableComponent implements OnInit {
  dataFrame!: ProjectDataFrame;
  @Output() clickProject = new EventEmitter<Project>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _projectService: ProjectService,
    protected _projectDialogService: ProjectDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  async ngOnInit() {
    this.dataFrame = new ProjectDataFrame(
      this._projectService,
      this._queryParamsService.getQueryParams()
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
  }

  protected async _createOrEditProject(project?: Project): Promise<void> {
    const dialogRef = this._projectDialogService.openProjectDialog(project);
    const resultingProject = await firstValueFrom(dialogRef.afterClosed());
    if (resultingProject) {
      this.dataFrame.addOrUpdateItem(resultingProject);
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
      this.dataFrame.removeItem(project);
    }
  }

  onHideColumns() {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
