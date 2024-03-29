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
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { ProjectInteractionService } from '../shared/services/project-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import { ImportDatasetDialogService } from '../shared/components/import-dataset-dialog.component';

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
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _importDatasetDialogService: ImportDatasetDialogService,
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

  async onExportProjectsDataset() {
    const dialogRef = this._exportDatasetDialogService.openExportDatasetDialog(
      'Projects',
      await firstValueFrom(this.exportQueryParams$),
      {
        downloadExcel: this._projectService.downloadProjectExcel.bind(
          this._projectService
        ),
        downloadCsv: this._projectService.downloadProjectCsv.bind(
          this._projectService
        ),
        getColumnNames: this._projectService.getProjectExcelColumnNames.bind(
          this._projectService
        ),
      },
      'projects'
    );
    await firstValueFrom(dialogRef.afterClosed());
  }

  async onImportProjectsDataset(): Promise<void> {
    const dialogRef = this._importDatasetDialogService.openImportDatasetDialog(
      'Projects',
      {
        uploadExcel: this._projectService.uploadProjectExcel.bind(
          this._projectService
        ),
        uploadCsv: this._projectService.uploadProjectCsv.bind(
          this._projectService
        ),
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
