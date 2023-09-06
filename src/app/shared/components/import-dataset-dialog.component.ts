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

import { Component, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IUploadState } from '../services/upload.service';

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
  ): MatDialogRef<ImportDatasetDialogComponent, IUploadState> {
    return this._dialog.open(ImportDatasetDialogComponent, {
      width: '500px',
      data: importDatasetService,
    });
  }
}

@Component({
  selector: 'mvtool-import-dataset-dialog',
  template: ` <p>import-dataset-dialog works!</p> `,
  styles: [],
})
export class ImportDatasetDialogComponent {}
