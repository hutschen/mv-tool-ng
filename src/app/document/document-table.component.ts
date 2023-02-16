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
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { TableColumns } from '../shared/table-columns';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { DocumentService, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';
import { DocumentDialogService } from './document-dialog.component';
import { DocumentDataFrame } from '../shared/data/document/document-frame';
import { QueryParamsService } from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';

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
    this.dataFrame = new DocumentDataFrame(
      this._documentService,
      this.project,
      this._queryParamsService.getQueryParams()
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
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
        this._documentService.downloadDocumentExcel(this.project.id),
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
          return this._documentService.uploadDocumentExcel(
            this.project.id,
            file
          );
        } else {
          throw new Error('Project is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state == 'done') {
      this.dataFrame.reload();
    }
  }

  onHideColumns(): void {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
