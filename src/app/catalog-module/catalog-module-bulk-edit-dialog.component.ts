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
import { NgForm } from '@angular/forms';
import { finalize, firstValueFrom } from 'rxjs';
import { PatchEditFlags } from '../shared/patch-edit-flags';
import { BulkEditScope } from '../shared/bulk-edit-scope';

export interface ICatalogModuleBulkEditDialogData {
  queryParams: IQueryParams;
  scope: BulkEditScope;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCatalogModuleBulkEditDialog(
    queryParams: IQueryParams = {},
    scope: BulkEditScope = 'all'
  ): MatDialogRef<
    CatalogModuleBulkEditDialogComponent,
    CatalogModule[] | undefined
  > {
    return this._dialog.open(CatalogModuleBulkEditDialogComponent, {
      width: '550px',
      data: { queryParams, scope },
    });
  }
}

@Component({
  selector: 'mvtool-catalog-module-bulk-edit-dialog',
  templateUrl: './catalog-module-bulk-edit-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [
    '.checkbox { margin-bottom: 21.5px; }',
    '.toggle { text-align: right; margin: -8px 0 16px 0;}',
    '.fx-center { align-items: center; }',
  ],
})
export class CatalogModuleBulkEditDialogComponent extends PatchEditFlags<ICatalogModulePatch> {
  patch: ICatalogModulePatch = {};
  readonly defaultValues = {
    reference: null,
    title: '',
    description: null,
  };
  readonly queryParams: IQueryParams;
  readonly scope: BulkEditScope;
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<CatalogModuleBulkEditDialogComponent>,
    protected _catalogModuleService: CatalogModuleService,
    @Inject(MAT_DIALOG_DATA)
    data: ICatalogModuleBulkEditDialogData
  ) {
    super();
    this.queryParams = data.queryParams;
    this.scope = data.scope;
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          this._catalogModuleService
            .patchCatalogModules(this.patch, this.queryParams)
            .pipe(
              finalize(() => {
                this.isSaving = false;
                this._dialogRef.disableClose = false;
              })
            )
        )
      );
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
