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
  columns = new TableColumns<Document>([
    { id: 'reference', label: 'Reference', optional: true },
    { id: 'title', label: 'Title' },
    { id: 'description', label: 'Description', optional: true },
    { id: 'options' },
  ]);
  protected _dataSubject = new ReplaySubject<Document[]>(1);
  data$: Observable<Document[]> = this._dataSubject.asObservable();
  dataLoaded: boolean = false;
  @Input() project: Project | null = null;
  // @Output() documentClicked = new EventEmitter<Document>()

  constructor(
    protected _documentService: DocumentService,
    protected _documentDialogService: DocumentDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadDocuments();
  }

  protected async _createOrEditDocument(document?: Document) {
    if (this.project) {
      const dialogRef = this._documentDialogService.openDocumentDialog(
        this.project,
        document
      );
      const resultingDocument = await firstValueFrom(dialogRef.afterClosed());
      if (resultingDocument) {
        await this.onReloadDocuments();
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
      await this.onReloadDocuments();
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
      await this.onReloadDocuments();
    }
  }

  async onReloadDocuments(): Promise<void> {
    if (this.project) {
      const data = await firstValueFrom(
        this._documentService.listDocuments_legacy(this.project.id)
      );
      this._dataSubject.next(data);
      this.dataLoaded = true;
    } else {
      throw new Error('Project is undefined');
    }
  }
}
