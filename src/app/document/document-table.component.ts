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
import { MatDialog } from '@angular/material/dialog';
import {
  DownloadDialogComponent,
  IDownloadDialogData,
} from '../shared/components/download-dialog.component';
import { ITableColumn } from '../shared/components/table.component';
import { UploadDialogComponent } from '../shared/components/upload-dialog.component';
import { DocumentService, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';
import { IUploadState } from '../shared/services/upload.service';
import {
  DocumentDialogComponent,
  IDocumentDialogData,
} from './document-dialog.component';

@Component({
  selector: 'mvtool-document-table',
  templateUrl: './document-table.component.html',
  styleUrls: ['../shared/styles/mat-table.css', '../shared/styles/flex.css'],
  styles: [],
})
export class DocumentTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'reference', optional: true },
    { name: 'title', optional: false },
    { name: 'description', optional: true },
    { name: 'options', optional: false },
  ];
  data: Document[] = [];
  dataLoaded: boolean = false;
  @Input() project: Project | null = null;
  // @Output() documentClicked = new EventEmitter<Document>()

  constructor(
    protected _documentService: DocumentService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadDocuments();
    this.dataLoaded = true;
  }

  protected _openDocumentDialog(document: Document | null = null): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        document: document,
      } as IDocumentDialogData,
    });
    dialogRef.afterClosed().subscribe((document: Document | null) => {
      if (document) {
        this.onReloadDocuments();
      }
    });
  }

  onCreateDocument(): void {
    this._openDocumentDialog();
  }

  onEditDocument(document: Document): void {
    this._openDocumentDialog(document);
  }

  onDeleteDocument(document: Document): void {
    this._documentService
      .deleteDocument(document.id)
      .subscribe(this.onReloadDocuments.bind(this));
  }

  onExportDocuments(): void {
    if (this.project) {
      this._dialog.open(DownloadDialogComponent, {
        width: '500px',
        data: {
          download$: this._documentService.downloadDocumentExcel(
            this.project.id
          ),
          filename: 'documents.xlsx',
        } as IDownloadDialogData,
      });
    }
  }

  onImportDocuments(): void {
    if (this.project) {
      const projectId = this.project.id;
      const dialogRef = this._dialog.open(UploadDialogComponent, {
        width: '500px',
        data: (file: File) => {
          return this._documentService.uploadDocumentExcel(projectId, file);
        },
      });
      dialogRef.afterClosed().subscribe((uploadState: IUploadState | null) => {
        if (uploadState && uploadState.state == 'done') {
          this.onReloadDocuments();
        }
      });
    }
  }

  onReloadDocuments(): void {
    if (this.project) {
      this._documentService
        .listDocuments(this.project.id)
        .subscribe((documents) => {
          this.data = documents;
        });
    }
  }
}
