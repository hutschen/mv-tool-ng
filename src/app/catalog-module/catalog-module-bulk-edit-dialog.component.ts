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
  CatalogModuleService,
  ICatalogModulePatch,
} from '../shared/services/catalog-module.service';
import { IQueryParams } from '../shared/services/query-params.service';
import { isEmpty } from 'radash';
import { NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

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
  ): MatDialogRef<
    CatalogModuleBulkEditDialogComponent,
    CatalogModule[] | undefined
  > {
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
  readonly editFlags = {
    reference: false,
    title: false,
    description: false,
  };
  readonly queryParams: IQueryParams;
  readonly filtered: boolean;

  constructor(
    protected _dialogRef: MatDialogRef<CatalogModuleBulkEditDialogComponent>,
    protected _catalogModuleService: CatalogModuleService,
    @Inject(MAT_DIALOG_DATA)
    data: ICatalogModuleBulkEditDialogData
  ) {
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
  }

  onEditFlagChange(key: 'reference' | 'title' | 'description'): void {
    if (this.editFlags[key]) {
      if (key !== 'title') this.patch[key] = null;
    } else {
      delete this.patch[key];
    }
  }

  get isPatchEmpty(): boolean {
    return isEmpty(this.patch);
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      this._dialogRef.close(
        await firstValueFrom(
          this._catalogModuleService.patchCatalogModules(
            this.patch,
            this.queryParams
          )
        )
      );
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
