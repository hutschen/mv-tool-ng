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
import { Observable, firstValueFrom } from 'rxjs';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDataFrame } from '../shared/data/project/project-frame';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { ProjectInteractionService } from '../shared/services/project-interaction.service';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['../shared/styles/table.scss', '../shared/styles/flex.scss'],
  styles: [],
})
export class ProjectTableComponent implements OnInit {
  dataFrame!: ProjectDataFrame;
  marked!: DataSelection<Project>;
  expanded!: DataSelection<Project>;
  exportQueryParams$!: Observable<IQueryParams>;
  @Output() clickProject = new EventEmitter<Project>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _projectService: ProjectService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    readonly projectInteractions: ProjectInteractionService
  ) {}

  async ngOnInit() {
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new ProjectDataFrame(
      this._projectService,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.projectInteractions);

    // Sync query params with query params service
    const syncQueryParams$ = combineQueryParams([
      this.dataFrame.queryParams$,
      this.marked.queryParams$,
      this.expanded.queryParams$,
    ]);
    this._queryParamsService.syncQueryParams(syncQueryParams$).subscribe();

    // Define export query params
    this.exportQueryParams$ = combineQueryParams([
      this.dataFrame.search.queryParams$,
      this.dataFrame.columns.filterQueryParams$,
      this.dataFrame.sort.queryParams$,
    ]);
  }

  async onExportProjectsExcel(): Promise<void> {
    const dialogRef = this._downloadDialogService.openDownloadDialog(
      this._projectService.downloadProjectsExcel({
        ...(await firstValueFrom(this.exportQueryParams$)),
      }),
      'projects.xlsx'
    );
    await firstValueFrom(dialogRef.afterClosed());
  }

  async onImportProjectsExcel(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        return this._projectService.uploadProjectsExcel(file);
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state === 'done') {
      this.dataFrame.reload();
    }
  }

  onHideColumns() {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
