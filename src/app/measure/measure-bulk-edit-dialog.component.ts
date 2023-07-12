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
  Measure,
  MeasureService,
  IMeasurePatch,
} from '../shared/services/measure.service';
import { NgForm } from '@angular/forms';
import { finalize, firstValueFrom } from 'rxjs';
import { Project } from '../shared/services/project.service';
import { DocumentService } from '../shared/services/document.service';
import { DocumentOptions } from '../shared/data/document/document-options';
import { PatchEditFlags } from '../shared/patch-edit-flags';
import { BulkEditScope } from '../shared/bulk-edit-scope';

export interface IMeasureBulkEditDialogData {
  project: Project;
  queryParams: IQueryParams;
  scope: BulkEditScope;
  fieldNames: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MeasureBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openMeasureBulkEditDialog(
    project: Project,
    queryParams: IQueryParams = {},
    scope: BulkEditScope = 'all',
    fieldNames: string[] = []
  ): MatDialogRef<MeasureBulkEditDialogComponent, Measure[] | undefined> {
    return this._dialog.open(MeasureBulkEditDialogComponent, {
      width: '550px',
      data: { project, queryParams, scope, fieldNames },
    });
  }
}

@Component({
  selector: 'mvtool-measure-bulk-edit-dialog',
  templateUrl: './measure-bulk-edit-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [
    '.checkbox { margin-bottom: 21.5px; }',
    '.fx-center { align-items: center; }',
  ],
})
export class MeasureBulkEditDialogComponent extends PatchEditFlags<IMeasurePatch> {
  readonly complianceFlags: (keyof IMeasurePatch)[] = [
    'compliance_status',
    'compliance_comment',
  ];
  readonly completionFlags: (keyof IMeasurePatch)[] = [
    'completion_status',
    'completion_comment',
  ];
  readonly verificationFlags: (keyof IMeasurePatch)[] = [
    'verification_method',
    'verification_status',
    'verification_comment',
  ];

  patch: IMeasurePatch = {};
  readonly defaultValues = {
    reference: null,
    summary: '',
    description: null,
    compliance_status: null,
    compliance_comment: null,
    completion_status: null,
    completion_comment: null,
    verification_method: null,
    verification_status: null,
    verification_comment: null,
    document_id: null,
  };
  readonly queryParams: IQueryParams;
  readonly scope: BulkEditScope;
  protected _fieldNames: string[];
  isSaving: boolean = false;

  // To select project related documents
  documentOptions: DocumentOptions;

  constructor(
    protected _dialogRef: MatDialogRef<MeasureBulkEditDialogComponent>,
    protected _measureService: MeasureService,
    documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) data: IMeasureBulkEditDialogData
  ) {
    super();
    this.queryParams = data.queryParams;
    this.scope = data.scope;
    this._fieldNames = data.fieldNames;

    this.documentOptions = new DocumentOptions(
      documentService,
      data.project,
      false
    );
  }

  hasField(fieldName: string): boolean {
    return this._fieldNames.includes(fieldName);
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          this._measureService.patchMeasures(this.patch, this.queryParams).pipe(
            finalize(() => {
              this.isSaving = false;
              this._dialogRef.disableClose = false;
            })
          )
        )
      );
    }
  }

  onCancel() {
    this._dialogRef.close();
  }
}
