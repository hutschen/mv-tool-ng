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
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { IQueryParams } from '../services/query-params.service';
import { IDownloadState } from '../services/download.service';
import { Observable, of, switchMap } from 'rxjs';
import { SafeResourceUrl } from '@angular/platform-browser';
import { IOption, Options } from '../data/options';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

export interface IExportDatasetService {
  downloadDataset(params: IQueryParams): Observable<IDownloadState>;
  getColumnNames(): Observable<string[]>;
}

interface IExportDatasetDialogData {
  datasetName: string;
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

@Injectable({
  providedIn: 'root',
})
export class ExportDatasetDialogService {
  constructor(protected _dialog: MatDialog) {}

  openExportDatasetDialog(
    datasetName: string,
    exportDatasetService: IExportDatasetService,
    filename: string = 'export'
  ): MatDialogRef<ExportDatasetDialogComponent> {
    return this._dialog.open(ExportDatasetDialogComponent, {
      width: '550px',
      data: {
        datasetName,
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
  readonly exportDatasetService: IExportDatasetService;
  columnNameOptions!: Options;
  filename: string;
  downloadUrl?: SafeResourceUrl;

  // Form groups for the different steps in the dialog
  selectColumnsForm: FormGroup;
  chooseFilenameForm: FormGroup;

  constructor(
    protected _dialogRef: MatDialogRef<ExportDatasetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IExportDatasetDialogData,
    formBuilder: FormBuilder
  ) {
    this.datasetName = dialogData.datasetName;
    this.exportDatasetService = dialogData.exportDatasetService;
    this.columnNameOptions = new ColumnNameOptions(this.exportDatasetService);
    this.filename = dialogData.filename;

    // Create form groups for the different steps in the dialog
    this.selectColumnsForm = formBuilder.group(
      {},
      {
        validators: (): ValidationErrors | null =>
          this.columnNameOptions.selection.length >= 1
            ? null
            : { selection: false },
      }
    );
    this.chooseFilenameForm = formBuilder.group({
      filenameInput: ['', Validators.required],
    });

    // Validate selectColumnsForm when columnNameOptions changes
    this.columnNameOptions.selectionChanged$.subscribe(() =>
      this.selectColumnsForm.updateValueAndValidity()
    );
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
