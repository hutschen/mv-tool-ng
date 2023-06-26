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
import {
  CatalogModule,
  ICatalogModulePatch,
} from '../shared/services/catalog-module.service';
import { IQueryParams } from '../shared/services/query-params.service';
import { isEmpty } from 'radash';

export interface ICatalogModuleBulkEditDialogData {
  queryParams: IQueryParams;
  filtered: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCatalogModuleBulkEditDialog(
    queryParams: IQueryParams = {},
    filtered: boolean = false
  ): MatDialogRef<CatalogModuleBulkEditDialogComponent, CatalogModule[]> {
    return this._dialog.open(CatalogModuleBulkEditDialogComponent, {
      width: '550px',
      data: { queryParams, filtered },
    });
  }
}

@Component({
  selector: 'mvtool-catalog-module-bulk-edit-dialog',
  templateUrl: './catalog-module-bulk-edit-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [
    '.checkbox { margin-bottom: 21.5px; }',
    '.fx-center { align-items: center; }',
  ],
})
export class CatalogModuleBulkEditDialogComponent {
  patch: ICatalogModulePatch = {};
  readonly flags = {
    reference: false,
    title: false,
    description: false,
  };
  readonly queryParams: IQueryParams;
  readonly filtered: boolean;

  constructor(
    protected _dialogRef: MatDialogRef<CatalogModuleBulkEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    data: ICatalogModuleBulkEditDialogData
  ) {
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
  }

  onFlagChange(key: 'reference' | 'title' | 'description'): void {
    if (this.flags[key]) {
      if (key !== 'title') {
        this.patch[key] = null;
      }
    } else {
      delete this.patch[key];
    }
  }

  get isPatchEmpty(): boolean {
    return isEmpty(this.patch);
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
