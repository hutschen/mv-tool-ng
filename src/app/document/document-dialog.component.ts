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
