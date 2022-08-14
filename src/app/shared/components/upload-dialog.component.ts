import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IUploadState } from '../services/upload.service';

@Component({
  selector: 'mvtool-upload-dialog',
  template: `
    <mat-label>File</mat-label>
    <button mat-raised-button (click)="fileInput.click()">
      {{ file ? file.name : 'Choose file' }}
    </button>
    <input
      hidden
      type="file"
      #fileInput
      (change)="onFileInput(fileInput.files)"
    />

    <button
      [disabled]="!file"
      type="submit"
      mat-raised-button
      color="primary"
      (click)="onSubmit()"
    >
      Submit
    </button>
  `,
  styles: [],
})
export class UploadDialogComponent {
  file: File | null = null;
  uploadState: IUploadState | null = null;
  protected _callback: (file: File) => Observable<IUploadState>;

  constructor(
    protected _dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) callback: (file: File) => Observable<IUploadState>
  ) {
    this._callback = callback;
  }

  onFileInput(files: FileList | null): void {
    if (files) {
      this.file = files.item(0);
    }
  }

  onSubmit(): void {
    if (this.file) {
      // handle upload
      const subscription = this._callback(this.file).subscribe(
        (uploadState) => {
          this.uploadState = uploadState;
        }
      );

      // handle when dialog is closed
      this._dialogRef.afterClosed().subscribe(() => {
        subscription.unsubscribe();
      });
    }
  }
}
