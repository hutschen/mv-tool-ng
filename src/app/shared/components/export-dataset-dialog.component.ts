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

@Injectable({
  providedIn: 'root',
})
export class ExportDatasetDialogService {
  constructor(protected _dialog: MatDialog) {}

  openExportDatasetDialog(): MatDialogRef<ExportDatasetDialogComponent> {
    return this._dialog.open(ExportDatasetDialogComponent, {
      width: '500px',
    });
  }
}

@Component({
  selector: 'mvtool-export-dataset-dialog',
  templateUrl: './export-dataset-dialog.component.html',
  styles: [],
})
export class ExportDatasetDialogComponent {}
