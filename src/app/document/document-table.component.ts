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
import { Observable, firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { DocumentService, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';
import { DocumentDialogService } from './document-dialog.component';
import { DocumentDataFrame } from '../shared/data/document/document-frame';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';

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
  @Input() project?: Project;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _documentService: DocumentService,
    protected _documentDialogService: DocumentDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
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

  protected async _createOrEditDocument(document?: Document) {
    if (this.project) {
      const dialogRef = this._documentDialogService.openDocumentDialog(
        this.project,
        document
      );
      const resultingDocument = await firstValueFrom(dialogRef.afterClosed());
      if (resultingDocument) {
        this.dataFrame.addOrUpdateItem(resultingDocument);
      }
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onCreateDocument(): Promise<void> {
    await this._createOrEditDocument();
  }

  async onEditDocument(document: Document): Promise<void> {
    await this._createOrEditDocument(document);
  }

  async onDeleteDocument(document: Document): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Document',
      `Do you really want to delete the document "${document.title}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._documentService.deleteDocument(document.id));
      this.dataFrame.removeItem(document);
    }
  }

  async onExportDocuments(): Promise<void> {
    if (this.project) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._documentService.downloadDocumentExcel({
          project_ids: this.project.id,
          ...(await firstValueFrom(this.exportQueryParams$)),
        }),
        'documents.xlsx'
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
