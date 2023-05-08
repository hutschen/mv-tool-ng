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
import { Observable } from 'rxjs';
import { SafeResourceUrl } from '@angular/platform-browser';

export interface IExportDatasetService {
  downloadDataset(params: IQueryParams): Observable<IDownloadState>;
  getColumnNames(): Observable<string[]>;
}

interface IExportDatasetDialogData {
  datasetName: string;
  exportDatasetService: IExportDatasetService;
  filename: string;
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
  styles: [],
})
export class ExportDatasetDialogComponent {
  readonly datasetName: string;
  readonly exportDatasetService: IExportDatasetService;
  filename: string;
  downloadUrl?: SafeResourceUrl;

  constructor(
    protected _dialogRef: MatDialogRef<ExportDatasetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IExportDatasetDialogData
  ) {
    this.datasetName = dialogData.datasetName;
    this.exportDatasetService = dialogData.exportDatasetService;
    this.filename = dialogData.filename;
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
