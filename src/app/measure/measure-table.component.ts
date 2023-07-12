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
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { MeasureDataFrame } from '../shared/data/measure/measure-frame';
import { DocumentService } from '../shared/services/document.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { Requirement } from '../shared/services/requirement.service';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { MeasureInteractionService } from '../shared/services/measure-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogService,
} from '../shared/components/confirm-dialog.component';
import { isEmpty } from 'radash';
import { MeasureBulkEditDialogService } from './measure-bulk-edit-dialog.component';
import { BulkEditScope, toBulkEditScope } from '../shared/bulk-edit-scope';

@Component({
  selector: 'mvtool-http-measure-table',
  templateUrl: './measure-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class MeasureTableComponent implements OnInit {
  dataFrame!: MeasureDataFrame;
  marked!: DataSelection<Measure>;
  expanded!: DataSelection<Measure>;
  exportQueryParams$!: Observable<IQueryParams>;
  bulkEditQueryParams$!: Observable<IQueryParams>;
  bulkEditScope$!: Observable<BulkEditScope>;
  @Input() requirement!: Requirement;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _measureService: MeasureService,
    protected _documentService: DocumentService,
    protected _measureBulkEditDialogService: MeasureBulkEditDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    readonly measureInteractions: MeasureInteractionService
  ) {}

  ngOnInit(): void {
    if (!this.requirement) throw new Error('Requirement is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new MeasureDataFrame(
      this._measureService,
      this._documentService,
      this.requirement,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.measureInteractions);

    // Sync query params
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
      this.marked.selection$.pipe(
        map((selection) =>
          selection.length > 0 ? { ids: selection } : ({} as IQueryParams)
        )
      ),
    ]);

    // Define bulk edit all flag
    this.bulkEditScope$ = this.bulkEditQueryParams$.pipe(
      map((queryParams) => toBulkEditScope(queryParams))
    );
  }

  async onEditMeasures() {
    if (this.requirement) {
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      const dialogRef =
        this._measureBulkEditDialogService.openMeasureBulkEditDialog(
          this.requirement.project,
          { requirement_ids: this.requirement.id, ...queryParams },
          !isEmpty(queryParams),
          await firstValueFrom(this.dataFrame.getColumnNames())
        );
      const measures = await firstValueFrom(dialogRef.afterClosed());
      if (measures) this.dataFrame.reload();
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  async onDeleteMeasures() {
    if (this.requirement) {
      let dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>;
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      if (isEmpty(queryParams)) {
        dialogRef = this._confirmDialogService.openConfirmDialog(
          'Delete all measures?',
          'Are you sure you want to delete all measures related to this requirement?'
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
            requirement_ids: this.requirement.id,
            ...queryParams,
          })
        );
        this.dataFrame.reload();
      }
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  async onExportMeasuresDataset() {
    if (this.requirement) {
      const dialogRef =
        this._exportDatasetDialogService.openExportDatasetDialog(
          'Measures',
          {
            requirement_ids: this.requirement.id,
            ...(await firstValueFrom(this.exportQueryParams$)),
          },
          {
            downloadDataset: this._measureService.downloadMeasureExcel.bind(
              this._measureService
            ),
            getColumnNames:
              this._measureService.getMeasureExcelColumnNames.bind(
                this._measureService
              ),
          },
          'measures'
        );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  async onImportMeasures(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.requirement) {
          return this._measureService.uploadMeasureExcel(file, {
            fallback_requirement_id: this.requirement.id,
          });
        } else {
          throw new Error('Requirement is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state === 'done') {
      this.dataFrame.reload();
    }
  }

  onHideColumns(): void {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
