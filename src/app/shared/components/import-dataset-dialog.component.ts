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
import { Observable, finalize, tap } from 'rxjs';
import { IUploadState } from '../services/upload.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IOption } from '../data/options';
import { ICsvSettings } from './csv-settings-input.component';
import { IQueryParams } from '../services/query-params.service';

export interface IImportDatasetService {
  uploadExcel(file: File, params?: IQueryParams): Observable<IUploadState>;
  uploadCsv(file: File, params?: IQueryParams): Observable<IUploadState>;
}

export interface IImportDatasetDialogData {
  datasetName: string;
  importDatasetService: IImportDatasetService;
}

@Injectable({
  providedIn: 'root',
})
export class ImportDatasetDialogService {
  constructor(protected _dialog: MatDialog) {}

  openImportDatasetDialog(
    datasetName: string,
    importDatasetService: IImportDatasetService
  ): MatDialogRef<ImportDatasetDialogComponent, IUploadState | null> {
    const data: IImportDatasetDialogData = {
      datasetName,
      importDatasetService,
    };
    return this._dialog.open(ImportDatasetDialogComponent, {
      width: '500px',
      data,
    });
  }
}

@Component({
  selector: 'mvtool-import-dataset-dialog',
  template: `
    <div mat-dialog-title>Import {{ _datasetName }}</div>
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
export class ImportDatasetDialogComponent implements OnInit {
  protected _datasetName: string;
  protected _importDatasetService: IImportDatasetService;
  protected _uploadForm!: FormGroup;
  protected _upload$: Observable<IUploadState> | null = null;
  protected _formats: IOption[] = [
    { label: 'Excel', value: 'xlsx' },
    { label: 'CSV', value: 'csv' },
  ];

  constructor(
    protected _dialogRef: MatDialogRef<
      ImportDatasetDialogComponent,
      IUploadState | null
    >,
    @Inject(MAT_DIALOG_DATA) dialogData: IImportDatasetDialogData
  ) {
    this._datasetName = dialogData.datasetName;
    this._importDatasetService = dialogData.importDatasetService;
  }

  ngOnInit(): void {
    const fileCtrl = new FormControl<File | null>(null, Validators.required);
    const formatCtrl = new FormControl('xlsx', Validators.required);
    const csvSettingsCtrl = new FormControl<ICsvSettings | null>(
      { encoding: 'utf-8-sig', delimiter: ';' },
      Validators.required
    );

    this._uploadForm = new FormGroup({
      file: fileCtrl,
      format: formatCtrl,
    });

    // Set format to CSV if file name ends with .csv
    fileCtrl.valueChanges.subscribe((file) => {
      if (file && file.name.endsWith('.csv')) {
        formatCtrl.setValue('csv');
      } else {
        formatCtrl.setValue('xlsx');
      }
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

  onUpload(): void {
    // Perform checks for the case where the form not submitted by the submit button
    if (this._upload$) return;
    if (this._uploadForm.invalid) throw new Error('Form is invalid');

    // Prepare upload
    let upload$: Observable<IUploadState>;
    if (this._uploadForm.value.format === 'csv') {
      upload$ = this._importDatasetService.uploadCsv(
        this._uploadForm.value.file,
        this._uploadForm.value.csvSettings
      );
    } else {
      upload$ = this._importDatasetService.uploadExcel(
        this._uploadForm.value.file
      );
    }

    // Start upload by assinging upload$ to this._upload$
    this._dialogRef.disableClose = true;
    this._upload$ = upload$.pipe(
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
