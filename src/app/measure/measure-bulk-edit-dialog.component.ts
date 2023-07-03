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
import { isEmpty } from 'radash';
import { NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Project } from '../shared/services/project.service';
import { DocumentService } from '../shared/services/document.service';
import { DocumentOptions } from '../shared/data/document/document-options';
import { IOption } from '../shared/data/options';

export interface IMeasureBulkEditDialogData {
  project: Project;
  queryParams: IQueryParams;
  filtered: boolean;
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
    filtered: boolean = false,
    fieldNames: string[] = []
  ): MatDialogRef<MeasureBulkEditDialogComponent, Measure[] | undefined> {
    return this._dialog.open(MeasureBulkEditDialogComponent, {
      width: '550px',
      data: { project, queryParams, filtered, fieldNames },
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
export class MeasureBulkEditDialogComponent {
  patch: IMeasurePatch = {};
  readonly editFlags = {
    reference: false,
    summary: false,
    description: false,
    compliance: false,
    completion: false,
    verification: false,
    jira_issue_id: false,
    document_id: false,
  };
  readonly queryParams: IQueryParams;
  readonly filtered: boolean;
  protected _fieldNames: string[];

  // To select project related documents
  documentOptions: IOption[] = [];

  constructor(
    protected _dialogRef: MatDialogRef<MeasureBulkEditDialogComponent>,
    protected _measureService: MeasureService,
    documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) data: IMeasureBulkEditDialogData
  ) {
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
    this._fieldNames = data.fieldNames;

    new DocumentOptions(documentService, data.project, false)
      .getAllOptions()
      .subscribe((documentOptions) => {
        this.documentOptions = documentOptions;
      });
  }

  onEditFlagChange(
    key:
      | 'reference'
      | 'summary'
      | 'description'
      | 'compliance'
      | 'completion'
      | 'verification'
      | 'jira_issue_id'
      | 'document_id'
  ) {
    switch (key) {
      case 'summary':
        if (!this.editFlags.summary) delete this.patch.summary;
        break;

      case 'compliance':
        if (this.editFlags.compliance) {
          this.patch.compliance_status = null;
          this.patch.compliance_comment = null;
        } else {
          delete this.patch.compliance_status;
          delete this.patch.compliance_comment;
        }
        break;

      case 'completion':
        if (this.editFlags.completion) {
          this.patch.completion_status = null;
          this.patch.completion_comment = null;
        } else {
          delete this.patch.completion_status;
          delete this.patch.completion_comment;
        }
        break;

      case 'verification':
        if (this.editFlags.verification) {
          this.patch.verification_method = null;
          this.patch.verification_status = null;
          this.patch.verification_comment = null;
        } else {
          delete this.patch.verification_method;
          delete this.patch.verification_status;
          delete this.patch.verification_comment;
        }
        break;

      default:
        if (this.editFlags[key]) this.patch[key] = null;
        else delete this.patch[key];
    }
  }

  hasField(fieldName: string): boolean {
    return this._fieldNames.includes(fieldName);
  }

  get isPatchEmpty(): boolean {
    return isEmpty(this.patch);
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      this._dialogRef.close(
        await firstValueFrom(
          this._measureService.patchMeasures(this.patch, this.queryParams)
        )
      );
    }
  }

  onCancel() {
    this._dialogRef.close();
  }
}
