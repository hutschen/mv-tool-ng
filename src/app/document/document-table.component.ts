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

import { Component, Input, OnInit } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { DocumentService, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';
import { DocumentDataFrame } from '../shared/data/document/document-frame';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { DocumentInteractionService } from '../shared/services/document-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogService,
} from '../shared/components/confirm-dialog.component';
import { isEmpty } from 'radash';
import { MatDialogRef } from '@angular/material/dialog';
import { DocumentBulkEditDialogService } from './document-bulk-edit-dialog.component';
import {
  BulkEditScope,
  toBulkEditScope,
  toBulkEditScopeText,
} from '../shared/bulk-edit-scope';

@Component({
  selector: 'mvtool-document-table',
  templateUrl: './document-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class DocumentTableComponent implements OnInit {
  dataFrame!: DocumentDataFrame;
  marked!: DataSelection<Document>;
  expanded!: DataSelection<Document>;
  exportQueryParams$!: Observable<IQueryParams>;
  bulkEditQueryParams$!: Observable<IQueryParams>;
  bulkEditScope$!: Observable<BulkEditScope>;
  @Input() project!: Project;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _documentService: DocumentService,
    protected _documentBulkEditDialogService: DocumentBulkEditDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    readonly documentInteractions: DocumentInteractionService
  ) {}

  ngOnInit(): void {
    if (!this.project) throw new Error('Project is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new DocumentDataFrame(
      this._documentService,
      this.project,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.documentInteractions);

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

  async onEditDocuments() {
    if (this.project) {
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      const dialogRef =
        this._documentBulkEditDialogService.openDocumentBulkEditDialog(
          { project_ids: this.project.id, ...queryParams },
          await firstValueFrom(this.bulkEditScope$)
        );
      const documents = await firstValueFrom(dialogRef.afterClosed());
      if (documents) this.dataFrame.reload();
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onDeleteDocuments() {
    if (this.project) {
      const scope = await firstValueFrom(this.bulkEditScope$);
      const dialogRef = this._confirmDialogService.openConfirmDialog(
        `Delete ${scope} documents?`,
        `Are you sure you want to delete ${toBulkEditScopeText(
          scope
        )} documents of this project?`
      );
      const confirm = await firstValueFrom(dialogRef.afterClosed());
      if (confirm) {
        await firstValueFrom(
          this._documentService.deleteDocuments({
            project_ids: this.project.id,
            ...(await firstValueFrom(this.bulkEditQueryParams$)),
          })
        );
        this.dataFrame.reload();
      }
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onExportDocumentsDataset() {
    if (this.project) {
      const dialogRef =
        this._exportDatasetDialogService.openExportDatasetDialog(
          'Documents',
          {
            project_ids: this.project.id,
            ...(await firstValueFrom(this.exportQueryParams$)),
          },
          {
            downloadExcel: this._documentService.downloadDocumentExcel.bind(
              this._documentService
            ),
            downloadCsv: this._documentService.downloadDocumentCsv.bind(
              this._documentService
            ),
            getColumnNames:
              this._documentService.getDocumentExcelColumnNames.bind(
                this._documentService
              ),
          },
          'documents'
        );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onImportDocuments(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.project) {
          return this._documentService.uploadDocumentExcel(file, {
            fallback_project_id: this.project.id,
          });
        } else {
          throw new Error('Project is undefined');
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
