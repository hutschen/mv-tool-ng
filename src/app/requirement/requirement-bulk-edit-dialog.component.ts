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
import { NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Project } from '../shared/services/project.service';
import {
  MilestoneOptions,
  TargetObjectOptions,
} from '../shared/data/requirement/requirement-options';
import { TargetObjectService } from '../shared/services/target-object.service';
import { MilestoneService } from '../shared/services/milestone.service';
import { PatchEditFlags } from '../shared/patch-edit-flags';

export interface IRequirementBulkEditDialogData {
  project: Project;
  queryParams: IQueryParams;
  filtered: boolean;
  fieldNames: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RequirementBulkEditDialogService {
  constructor(protected _dialog: MatDialog) {}

  openRequirementBulkEditDialog(
    project: Project,
    queryParams: IQueryParams = {},
    filtered: boolean = false,
    fieldNames: string[] = []
  ): MatDialogRef<
    RequirementBulkEditDialogComponent,
    Requirement[] | undefined
  > {
    return this._dialog.open(RequirementBulkEditDialogComponent, {
      width: '550px',
      data: { project, queryParams, filtered, fieldNames },
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
export class RequirementBulkEditDialogComponent extends PatchEditFlags<IRequirementPatch> {
  readonly complianceFlags: (keyof IRequirementPatch)[] = [
    'compliance_status',
    'compliance_comment',
  ];

  patch: IRequirementPatch = {};
  readonly defaultValues = {
    reference: null,
    summary: '',
    description: null,
    target_object: null,
    milestone: null,
    compliance_status: null,
    compliance_comment: null,
  };
  readonly queryParams: IQueryParams;
  readonly filtered: boolean;
  protected _fieldNames: string[];

  // To select project related target objects and milestones
  readonly targetObjectOptions: TargetObjectOptions;
  readonly milestoneOptions: MilestoneOptions;

  constructor(
    protected _dialogRef: MatDialogRef<RequirementBulkEditDialogComponent>,
    protected _requirementService: RequirementService,
    targetObjectService: TargetObjectService,
    milestoneService: MilestoneService,
    @Inject(MAT_DIALOG_DATA) data: IRequirementBulkEditDialogData
  ) {
    super();
    this.queryParams = data.queryParams;
    this.filtered = data.filtered;
    this._fieldNames = data.fieldNames;

    this.targetObjectOptions = new TargetObjectOptions(
      targetObjectService,
      data.project,
      false
    );

    this.milestoneOptions = new MilestoneOptions(
      milestoneService,
      data.project,
      false
    );
  }

  get hasCompliance(): boolean {
    return this._fieldNames.includes('compliance_status');
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
