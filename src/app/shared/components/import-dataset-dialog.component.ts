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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IUploadState } from '../services/upload.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IOption } from '../data/options';
import { ICsvSettings } from './csv-settings-input.component';

export interface IImportDatasetService {
  uploadExcel(file: File): Observable<IUploadState>;
  uploadCsv(file: File): Observable<IUploadState>;
}

@Injectable({
  providedIn: 'root',
})
export class ImportDatasetDialogService {
  constructor(protected _dialog: MatDialog) {}

  openImportDatasetDialog(
    importDatasetService: IImportDatasetService
  ): MatDialogRef<ImportDatasetDialogComponent, IUploadState | null> {
    return this._dialog.open(ImportDatasetDialogComponent, {
      width: '500px',
      data: importDatasetService,
    });
  }
}

@Component({
  selector: 'mvtool-import-dataset-dialog',
  template: `
    <div mat-dialog-content>
      <form
        *ngIf="!_uploadStarted"
        id="uploadForm"
        [formGroup]="_uploadForm"
        (submit)="onUpload()"
        class="fx-column"
      >
        <!-- Choose file -->

        <!-- Select file format -->
        <mat-form-field appearance="fill">
          <mat-label>File format</mat-label>
          <mat-select formControlName="format">
            <mat-option *ngFor="let format of _formats" [value]="format.value">
              {{ format.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- CSV settings -->
        <mvtool-csv-settings-input
          *ngIf="_uploadForm.get('csvSettings')"
          formControlName="csvSettings"
        ></mvtool-csv-settings-input>
      </form>

      <ng-template *ngIf="_uploadStarted">
        <!-- Progress bar -->
      </ng-template>
    </div>

    <!-- Actions -->
    <div mat-dialog-actions mat-dialog-actions align="end">
      <button mat-button (click)="onClose()" [disabled]="_uploadStarted">
        Cancel
      </button>
      <button
        mat-raised-button
        color="accent"
        type="submit"
        form="uploadForm"
        [disabled]="_uploadStarted || _uploadForm.invalid"
      >
        <mat-icon>file_upload</mat-icon>
        Upload file
      </button>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class ImportDatasetDialogComponent implements OnInit {
  protected _uploadForm!: FormGroup;
  protected _uploadState: IUploadState | null = null;
  protected _formats: IOption[] = [
    { label: 'Excel', value: 'xlsx' },
    { label: 'CSV', value: 'csv' },
  ];

  constructor(
    protected _dialogRef: MatDialogRef<
      ImportDatasetDialogComponent,
      IUploadState | null
    >,
    @Inject(MAT_DIALOG_DATA)
    protected _importDatasetService: IImportDatasetService
  ) {}

  ngOnInit(): void {
    const fileCtrl = new FormControl(null, [Validators.required]);
    const formatCtrl = new FormControl('xlsx', [Validators.required]);
    const csvSettingsCtrl = new FormControl<ICsvSettings | null>(
      { encoding: 'utf-8-sig', delimiter: ';' },
      [Validators.required]
    );

    this._uploadForm = new FormGroup({
      file: fileCtrl,
      format: formatCtrl,
    });

    // Add CSV settings control if format is CSV, remove otherwise
    formatCtrl.valueChanges.subscribe((format) => {
      if (format === 'csv') {
        this._uploadForm.addControl('csvSettings', csvSettingsCtrl);
      } else {
        this._uploadForm.removeControl('csvSettings');
      }
    });
  }

  protected get _uploadStarted(): boolean {
    return this._uploadState !== null;
  }

  onUpload(): void {
    // Perform checks for the case where the form not submitted by the submit button
    if (this._uploadStarted) return;
    if (this._uploadForm.invalid) throw new Error('Form is invalid');

    throw new Error('Method not implemented.');
  }

  onClose(): void {
    if (this._uploadStarted) throw new Error('Upload already started');
    this._dialogRef.close(null);
  }
}
