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
import { IQueryParams } from '../shared/services/query-params.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CatalogRequirement,
  CatalogRequirementService,
  ICatalogRequirementPatch,
} from '../shared/services/catalog-requirement.service';
import { NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PatchEditFlags } from '../shared/patch-edit-flags';

export interface ICatalogRequirementBulkEditDialogData {
  queryParams: IQueryParams;
  filtered: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogRequirementBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCatalogRequirementBulkEditDialog(
    queryParams: IQueryParams = {},
    filtered: boolean = false
  ): MatDialogRef<
    CatalogRequirementBulkEditDialogComponent,
    CatalogRequirement[] | undefined
  > {
    return this._dialog.open(CatalogRequirementBulkEditDialogComponent, {
      width: '550px',
      data: { queryParams, filtered },
    });
  }
}

@Component({
  selector: 'mvtool-catalog-requirement-bulk-edit-dialog',
  templateUrl: './catalog-requirement-bulk-edit-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [
    '.checkbox { margin-bottom: 21.5px; }',
    '.fx-center { align-items: center; }',
  ],
})
export class CatalogRequirementBulkEditDialogComponent extends PatchEditFlags<ICatalogRequirementPatch> {
  patch: ICatalogRequirementPatch = {};
  readonly defaultValues = {
    reference: null,
    summary: '',
    description: null,
  };
  readonly queryParams: IQueryParams;
  readonly filtered: boolean;

  constructor(
    protected _dialogRef: MatDialogRef<CatalogRequirementBulkEditDialogComponent>,
    protected _catalogRequirementService: CatalogRequirementService,
    @Inject(MAT_DIALOG_DATA) data: ICatalogRequirementBulkEditDialogData
  ) {
    super();
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      this._dialogRef.close(
        await firstValueFrom(
          this._catalogRequirementService.patchCatalogRequirements(
            this.patch,
            this.queryParams
          )
        )
      );
    }
  }

  onCancel() {
    this._dialogRef.close();
  }
}
