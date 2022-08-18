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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITableColumn } from '../shared/components/table.component';
import { DocumentService, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';
import {
  DocumentDialogComponent,
  IDocumentDialogData,
} from './document-dialog.component';

@Component({
  selector: 'mvtool-document-table',
  templateUrl: './document-table.component.html',
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

  onCreateDocument(): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: { project: this.project, document: null } as IDocumentDialogData,
    });
    dialogRef.afterClosed().subscribe(async (documentInput) => {
      if (documentInput && this.project) {
        await this._documentService.createDocument(
          this.project.id,
          documentInput
        );
        this.onReloadDocuments();
      }
    });
  }

  onEditDocument(document: Document): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        document: document,
      } as IDocumentDialogData,
    });
    dialogRef.afterClosed().subscribe(async (documentInput) => {
      if (documentInput) {
        await this._documentService.updateDocument(document.id, documentInput);
        this.onReloadDocuments();
      }
    });
  }

  async onDeleteDocument(document: Document): Promise<void> {
    await this._documentService.deleteDocument(document.id);
    this.onReloadDocuments();
  }

  onExportDocuments(): void {}
  onImportDocuments(): void {}

  async onReloadDocuments(): Promise<void> {
    if (this.project) {
      this.data = await this._documentService.listDocuments(this.project.id);
    }
  }
}
