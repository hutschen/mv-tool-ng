import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IUploadState } from '../services/upload.service';

@Component({
  selector: 'mvtool-upload-dialog',
  template: `
    <div mat-dialog-content>
      <!-- File input -->
      <div
        *ngIf="!uploadState"
        fxLayout="row"
        fxLayoutAlign="space-between center"
      >
        <mat-form-field appearance="fill" fxFlex="grow">
          <mat-label>Filename</mat-label>
          <input matInput readonly="true" [value]="file ? file.name : ''" />
        </mat-form-field>
        <div fxFlex="nogrow">
          <button mat-button (click)="fileInput.click()">
            <mat-icon>attach_file</mat-icon>
            Choose file
          </button>
          <input
            hidden
            type="file"
            #fileInput
            (change)="onFileInput(fileInput.files)"
          />
        </div>
      </div>

      <!-- Progress bar -->
      <div *ngIf="uploadState">
        <strong>
          <p *ngIf="uploadState.state == 'pending'">Preparing upload</p>
          <p *ngIf="uploadState.state != 'pending'">
            {{ uploadState.progress }}% complete
          </p>
        </strong>
        <mat-progress-bar
          [mode]="uploadState.state == 'pending' ? 'buffer' : 'determinate'"
          [value]="uploadState.progress"
        >
        </mat-progress-bar>
      </div>
    </div>

    <!-- Actions -->
    <div mat-dialog-actions mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Cancel</button>
      <button
        mat-raised-button
        [disabled]="uploadState || !file"
        color="accent"
        (click)="onUpload()"
      >
        <mat-icon>file_upload</mat-icon>
        Upload file
      </button>
    </div>
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

  onUpload(): void {
    if (this.file) {
      // handle upload
      const subscription = this._callback(this.file).subscribe(
        (uploadState) => {
          this.uploadState = uploadState;
          if (uploadState.state === 'done') {
            this.onClose();
          }
        }
      );

      // handle when dialog is closed
      this._dialogRef.afterClosed().subscribe(() => {
        subscription.unsubscribe();
      });
    }
  }

  onClose(): void {
    this._dialogRef.close(null);
  }
}
