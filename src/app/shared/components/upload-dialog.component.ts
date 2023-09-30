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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable, finalize, tap } from 'rxjs';
import { IUploadState } from '../services/upload.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
      <form
        *ngIf="!_upload$"
        id="uploadForm"
        [formGroup]="_uploadForm"
        (submit)="onUpload()"
        class="fx-column"
      >
        <!-- Choose file -->
        <mvtool-file-input formControlName="file"></mvtool-file-input>
      </form>

      <!-- Progress bar -->
      <mvtool-upload *ngIf="_upload$" [upload$]="_upload$"></mvtool-upload>
    </div>

    <!-- Actions -->
    <div mat-dialog-actions mat-dialog-actions align="end">
      <button mat-button (click)="onClose()" [disabled]="_upload$">
        Cancel
      </button>
      <button
        mat-raised-button
        color="accent"
        type="submit"
        form="uploadForm"
        [disabled]="_upload$ || _uploadForm.invalid"
      >
        <mat-icon>file_upload</mat-icon>
        Upload file
      </button>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class UploadDialogComponent implements OnInit {
  protected _uploadForm!: FormGroup;
  protected _upload$: Observable<IUploadState> | null = null;

  constructor(
    protected _dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    protected _callback: (file: File) => Observable<IUploadState>
  ) {}

  ngOnInit(): void {
    this._uploadForm = new FormGroup({
      file: new FormControl<File | null>(null, Validators.required),
    });
  }

  onUpload(): void {
    // Perform checks whether the upload can be started
    if (this._upload$) return;
    if (this._uploadForm.invalid) throw new Error('Form is invalid');

    // Start upload by assigning the observable to this._upload$
    this._dialogRef.disableClose = true;
    this._upload$ = this._callback(this._uploadForm.value.file).pipe(
      tap((uploadState) => {
        if (uploadState.state === 'done') this._dialogRef.close(uploadState);
      }),
      finalize(() => {
        this._upload$ = null;
        this._dialogRef.disableClose = false;
      })
    );
  }

  onClose(): void {
    if (this._upload$) throw new Error('Upload already started');
    this._dialogRef.close(null);
  }
}
