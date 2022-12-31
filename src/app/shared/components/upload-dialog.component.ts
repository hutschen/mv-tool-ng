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

import { Component, Inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IUploadState } from '../services/upload.service';

@Injectable({
  providedIn: 'root',
})
export class UploadDialogService {
  constructor(protected _dialog: MatDialog) {}

  openUploadDialog(
    callback: (file: File) => Observable<IUploadState>
  ): MatDialogRef<UploadDialogComponent, IUploadState> {
    const dialogRef = this._dialog.open(UploadDialogComponent, {
      width: '500px',
      data: callback,
    });
    return dialogRef;
  }
}

@Component({
  selector: 'mvtool-upload-dialog',
  template: `
    <div mat-dialog-content>
      <!-- File input -->
      <div *ngIf="!uploadState" class="fx-row fx-space-beetween-center">
        <mat-form-field appearance="fill" class="fx-grow">
          <mat-label>Filename</mat-label>
          <input matInput readonly="true" [value]="file ? file.name : ''" />
        </mat-form-field>
        <div class="fx-no-grow">
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
  styleUrls: ['../styles/flex.css'],
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
      const subscription = this._callback(this.file).subscribe({
        next: (uploadState) => {
          this.uploadState = uploadState;
          if (uploadState.state === 'done') {
            this.onClose();
          }
        },
        error: (error: any) => {
          this.onClose();
          throw error;
        },
      });

      // handle when dialog is closed
      this._dialogRef.afterClosed().subscribe(() => {
        subscription.unsubscribe();
      });
    }
  }

  onClose(): void {
    this._dialogRef.close(this.uploadState);
  }
}
