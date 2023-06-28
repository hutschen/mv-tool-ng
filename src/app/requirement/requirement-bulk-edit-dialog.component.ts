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
  Requirement,
  RequirementService,
  IRequirementPatch,
} from '../shared/services/requirement.service';
import { isEmpty } from 'radash';
import { NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

export interface IRequirementBulkEditDialogData {
  queryParams: IQueryParams;
  filtered: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RequirementBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openRequirementBulkEditDialog(
    queryParams: IQueryParams = {},
    filtered: boolean = false
  ): MatDialogRef<
    RequirementBulkEditDialogComponent,
    Requirement[] | undefined
  > {
    return this._dialog.open(RequirementBulkEditDialogComponent, {
      width: '550px',
      data: { queryParams, filtered },
    });
  }
}

@Component({
  selector: 'mvtool-requirement-bulk-edit-dialog',
  templateUrl: './requirement-bulk-edit-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [
    '.checkbox { margin-bottom: 21.5px; }',
    '.fx-center { align-items: center; }',
  ],
})
export class RequirementBulkEditDialogComponent {
  patch: IRequirementPatch = {};
  readonly editFlags = {
    reference: false,
    summary: false,
    description: false,
    target_object: false,
    milestone: false,
    compliance_status: false,
    compliance_comment: false,
  };
  readonly queryParams: IQueryParams;
  readonly filtered: boolean;

  constructor(
    protected _dialogRef: MatDialogRef<RequirementBulkEditDialogComponent>,
    protected _requirementService: RequirementService,
    @Inject(MAT_DIALOG_DATA) data: IRequirementBulkEditDialogData
  ) {
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
  }

  onEditFlagChange(
    key:
      | 'reference'
      | 'summary'
      | 'description'
      | 'target_object'
      | 'milestone'
      | 'compliance_status'
      | 'compliance_comment'
  ) {
    if (this.editFlags[key]) {
      if (key !== 'summary') this.patch[key] = null;
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
          this._requirementService.patchRequirements(
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
