// Copyright (C) 2023 Helmar Hutschenreuter
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

import { Component, Input, OnInit } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { MeasureDataFrame } from '../shared/data/measure/measure-frame';
import { CatalogModuleService } from '../shared/services/catalog-module.service';
import { CatalogService } from '../shared/services/catalog.service';
import { DocumentService } from '../shared/services/document.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { MilestoneService } from '../shared/services/milestone.service';
import { Project } from '../shared/services/project.service';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { RequirementService } from '../shared/services/requirement.service';
import { TargetObjectService } from '../shared/services/target-object.service';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { MeasureInteractionService } from '../shared/services/measure-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogService,
} from '../shared/components/confirm-dialog.component';
import { isEmpty } from 'radash';
import { MatDialogRef } from '@angular/material/dialog';
import { MeasureBulkEditDialogService } from '../measure/measure-bulk-edit-dialog.component';

@Component({
  selector: 'mvtool-project-measure-table',
  templateUrl: './project-measure-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class ProjectMeasureTableComponent implements OnInit {
  dataFrame!: MeasureDataFrame;
  marked!: DataSelection<Measure>;
  expanded!: DataSelection<Measure>;
  exportQueryParams$!: Observable<IQueryParams>;
  bulkEditQueryParams$!: Observable<IQueryParams>;
  bulkEditAll$!: Observable<boolean>;
  @Input() project!: Project;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _measureService: MeasureService,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    protected _requirementService: RequirementService,
    protected _milestoneService: MilestoneService,
    protected _targetObjectService: TargetObjectService,
    protected _documentService: DocumentService,
    protected _measureBulkEditDialogService: MeasureBulkEditDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    readonly measureInteractions: MeasureInteractionService
  ) {}

  ngOnInit(): void {
    if (!this.project) throw new Error('project is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new MeasureDataFrame(
      this._measureService,
      this._documentService,
      this.project,
      initialQueryParams,
      this._catalogService,
      this._catalogModuleService,
      this._requirementService,
      this._milestoneService,
      this._targetObjectService
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.measureInteractions);

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

    // Define bulk edit query params
    this.bulkEditQueryParams$ = combineQueryParams([
      this.dataFrame.search.queryParams$,
      this.dataFrame.columns.filterQueryParams$,
    ]);

    // Define bulk edit all flag
    this.bulkEditAll$ = this.bulkEditQueryParams$.pipe(
      map((queryParams) => isEmpty(queryParams))
    );
  }

  async onEditMeasures() {
    const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
    const dialogRef =
      this._measureBulkEditDialogService.openMeasureBulkEditDialog(
        { project_ids: this.project.id, ...queryParams },
        !isEmpty(queryParams),
        await firstValueFrom(this.dataFrame.columnNames$)
      );
    const measures = await firstValueFrom(dialogRef.afterClosed());
    if (measures) this.dataFrame.reload();
  }

  async onDeleteMeasures() {
    let dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>;
    const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
    if (isEmpty(queryParams)) {
      dialogRef = this._confirmDialogService.openConfirmDialog(
        'Delete all measures?',
        'Are you sure you want to delete all measures in this project?'
      );
    } else {
      dialogRef = this._confirmDialogService.openConfirmDialog(
        'Delete filtered measures?',
        'Are you sure you want to delete all measures that match the current filter?'
      );
    }
    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._measureService.deleteMeasures({
          project_ids: this.project.id,
          ...queryParams,
        })
      );
      this.dataFrame.reload();
    }
  }

  async onExportMeasuresDataset() {
    const dialogRef = this._exportDatasetDialogService.openExportDatasetDialog(
      'Measures',
      {
        project_ids: this.project.id,
        ...(await firstValueFrom(this.exportQueryParams$)),
      },
      {
        downloadDataset: this._measureService.downloadMeasureExcel.bind(
          this._measureService
        ),
        getColumnNames: this._measureService.getMeasureExcelColumnNames.bind(
          this._measureService
        ),
      },
      'measures'
    );
    await firstValueFrom(dialogRef.afterClosed());
  }

  onHideColumns(): void {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
