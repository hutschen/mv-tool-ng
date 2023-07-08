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

import { Component, Inject, Injectable } from '@angular/core';
import { IQueryParams } from '../shared/services/query-params.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  Document,
  DocumentService,
  IDocumentPatch,
} from '../shared/services/document.service';
import { NgForm } from '@angular/forms';
import { finalize, firstValueFrom } from 'rxjs';
import { PatchEditFlags } from '../shared/patch-edit-flags';

export interface IDocumentBulkEditDialogData {
  queryParams: IQueryParams;
  filtered: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openDocumentBulkEditDialog(
    queryParams: IQueryParams = {},
    filtered: boolean = false
  ): MatDialogRef<DocumentBulkEditDialogComponent, Document[] | undefined> {
    return this._dialog.open(DocumentBulkEditDialogComponent, {
      width: '550px',
      data: { queryParams, filtered },
    });
  }
}

@Component({
  selector: 'mvtool-document-bulk-edit-dialog',
  templateUrl: './document-bulk-edit-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [
    '.checkbox { margin-bottom: 21.5px; }',
    '.fx-center { align-items: center; }',
  ],
})
export class DocumentBulkEditDialogComponent extends PatchEditFlags<IDocumentPatch> {
  patch: IDocumentPatch = {};
  readonly defaultValues = {
    reference: null,
    title: '',
    description: null,
  };

  readonly queryParams: IQueryParams;
  readonly filtered: boolean;
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<DocumentBulkEditDialogComponent>,
    protected _documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) data: IDocumentBulkEditDialogData
  ) {
    super();
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          this._documentService
            .patchDocuments(this.patch, this.queryParams)
            .pipe(
              finalize(() => {
                this.isSaving = false;
                this._dialogRef.disableClose = false;
              })
            )
        )
      );
    }
  }

  onCancel() {
    this._dialogRef.close();
  }
}
