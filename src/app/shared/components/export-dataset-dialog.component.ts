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

import { Component, Inject, Injectable, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { IQueryParams } from '../services/query-params.service';
import { IDownloadState } from '../services/download.service';
import { Observable, Subject, Subscription, of, switchMap } from 'rxjs';
import { IOption, Options, StaticOptions } from '../data/options';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SelectionListComponent } from './selection-list.component';

export interface IExportDatasetService {
  downloadExcel(params: IQueryParams): Observable<IDownloadState>;
  getColumnNames(): Observable<string[]>;
}

interface IExportDatasetDialogData {
  datasetName: string;
  datasetQueryParams: IQueryParams;
  exportDatasetService: IExportDatasetService;
  filename: string;
}

class ColumnNameOptions extends Options {
  override readonly hasToLoad = true;

  constructor(protected _exportDatasetService: IExportDatasetService) {
    super(true);
  }

  override getOptions(...values: string[]): Observable<IOption[]> {
    return of(values.map((v) => ({ label: v, value: v })));
  }

  override filterOptions(..._: any[]): Observable<IOption[]> {
    return this._exportDatasetService
      .getColumnNames()
      .pipe(switchMap((columnNames) => this.getOptions(...columnNames)));
  }
}

function filenameValidator(control: FormControl): ValidationErrors | null {
  const validFilenameRegex = /^[^\\/:*?"<>|]+$/; // Regex to validate filename
  const isValid = validFilenameRegex.test(control.value);

  // If the test is valid, return null, otherwise return an error object
  return isValid ? null : { invalidFilename: { value: control.value } };
}

@Injectable({
  providedIn: 'root',
})
export class ExportDatasetDialogService {
  constructor(protected _dialog: MatDialog) {}

  openExportDatasetDialog(
    datasetName: string,
    datasetQueryParams: IQueryParams,
    exportDatasetService: IExportDatasetService,
    filename: string = 'export'
  ): MatDialogRef<ExportDatasetDialogComponent> {
    return this._dialog.open(ExportDatasetDialogComponent, {
      width: '550px',
      data: {
        datasetName,
        datasetQueryParams,
        exportDatasetService,
        filename,
      } as IExportDatasetDialogData,
    });
  }
}

@Component({
  selector: 'mvtool-export-dataset-dialog',
  templateUrl: './export-dataset-dialog.component.html',
  styleUrls: ['../styles/flex.scss'],
  styles: [
    '.step-form { padding-top: 16px; }',
    '.suffix { padding-right: 8px; padding-top: 16px; }',
  ],
})
export class ExportDatasetDialogComponent {
  readonly datasetName: string;
  readonly datasetQueryParams: IQueryParams;
  readonly exportDatasetService: IExportDatasetService;
  columnNameOptions!: Options;
  readonly formatOptions = new StaticOptions(
    [
      { label: 'Excel', value: 'xlsx' },
      { label: 'CSV', value: 'csv' },
    ],
    false
  );

  protected _downloadSubject = new Subject<IDownloadState>();
  protected _downloadSubscription?: Subscription;
  download$ = this._downloadSubject.asObservable();

  // Form groups for the different steps in the dialog
  selectColumnsForm: FormGroup;
  fileSettingsForm: FormGroup;

  @ViewChild('columnSelectionList')
  columnSelectionList?: SelectionListComponent;

  constructor(
    protected _dialogRef: MatDialogRef<ExportDatasetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IExportDatasetDialogData,
    formBuilder: FormBuilder
  ) {
    this.datasetName = dialogData.datasetName;
    this.datasetQueryParams = dialogData.datasetQueryParams;
    this.exportDatasetService = dialogData.exportDatasetService;
    this.columnNameOptions = new ColumnNameOptions(this.exportDatasetService);

    // Create form groups for the different steps in the dialog
    this.selectColumnsForm = formBuilder.group(
      {},
      {
        validators: (): ValidationErrors | null =>
          this.columnSelectionList?.isAllSelected ? { selection: false } : null,
      }
    );
    const csvSettingsCtrl = new FormControl(null, Validators.required);
    this.fileSettingsForm = formBuilder.group({
      filename: [dialogData.filename, [Validators.required, filenameValidator]],
      format: ['xlsx', Validators.required],
    });

    // Update csvSettingsCtrl when format changes
    this.fileSettingsForm.get('format')?.valueChanges.subscribe((format) => {
      if (format === 'csv') {
        this.fileSettingsForm.addControl('csvSettings', csvSettingsCtrl);
      } else {
        this.fileSettingsForm.removeControl('csvSettings');
      }
    });

    // Validate selectColumnsForm when columnNameOptions changes
    this.columnNameOptions.selectionChanged$.subscribe(() =>
      this.selectColumnsForm.updateValueAndValidity()
    );
  }

  get suffix(): string {
    return '.' + this.fileSettingsForm.get('format')?.value;
  }

  get filename(): string {
    return this.fileSettingsForm.get('filename')?.value + this.suffix;
  }

  get downloadStarted(): boolean {
    return this._downloadSubscription !== undefined;
  }

  onDownload(): void {
    if (this.downloadStarted) return;

    // Extract selected column names
    const selectedColumns = this.columnNameOptions.selection.map(
      (option) => option.value as string
    );

    // Compose query params for download
    const queryParams: IQueryParams =
      selectedColumns.length > 0
        ? { ...this.datasetQueryParams, hidden_columns: selectedColumns }
        : this.datasetQueryParams;

    this._downloadSubscription = this.exportDatasetService
      .downloadExcel(queryParams)
      .subscribe({
        next: (downloadState) => this._downloadSubject.next(downloadState),
        error: (error) => this._downloadSubject.error(error),
        complete: () => this._downloadSubject.complete(),
      });
  }

  onClose(): void {
    this._dialogRef.close();
    this._downloadSubscription?.unsubscribe();
  }
}
