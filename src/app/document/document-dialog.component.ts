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

import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDocumentInput, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';

export interface IDocumentDialogData {
  project: Project;
  document: Document | null;
}

@Component({
  selector: 'mvtool-document-dialog',
  templateUrl: './document-dialog.component.html',
  styles: ['textarea { min-height: 100px; }'],
})
export class DocumentDialogComponent {
  project: Project;
  documentInput: IDocumentInput = {
    reference: null,
    title: '',
    description: null,
  };

  constructor(
    protected _dialogRef: MatDialogRef<DocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IDocumentDialogData
  ) {
    this.project = this._dialogData.project;
    if (this._dialogData.document) {
      this.documentInput = this._dialogData.document.toDocumentInput();
    }
  }

  get createMode(): boolean {
    return this._dialogData.document === null;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._dialogRef.close(this.documentInput);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
