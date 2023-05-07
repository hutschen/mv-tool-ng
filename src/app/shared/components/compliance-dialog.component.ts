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
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  IMeasureInput,
  Measure,
  MeasureService,
} from '../services/measure.service';
import {
  ComplianceStatus,
  IRequirementInput,
  Requirement,
  RequirementService,
} from '../services/requirement.service';
import { ComplianceStatusOptions } from '../data/custom/custom-options';

@Injectable({
  providedIn: 'root',
})
export class ComplianceDialogService {
  constructor(protected _dialog: MatDialog) {}

  openComplianceDialog(
    item: Requirement | Measure
  ): MatDialogRef<ComplianceDialogComponent, Requirement | Measure> {
    const dialogRef = this._dialog.open(ComplianceDialogComponent, {
      width: '500px',
      data: item,
    });
    return dialogRef;
  }
}

@Component({
  selector: 'mvtool-compliance-dialog',
  templateUrl: './compliance-dialog.component.html',
  styleUrls: ['../styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class ComplianceDialogComponent {
  readonly complianceStatusOptions = new ComplianceStatusOptions(false);
  itemInput: IRequirementInput | IMeasureInput;
  protected _preservedComplianceComment: string | null = null;

  constructor(
    protected _dialogRef: MatDialogRef<ComplianceDialogComponent>,
    protected _requirementService: RequirementService,
    protected _measureService: MeasureService,
    @Inject(MAT_DIALOG_DATA) protected _item: Requirement | Measure
  ) {
    if (_item instanceof Requirement) {
      this.itemInput = _item.toRequirementInput();
    } else {
      this.itemInput = _item.toMeasureInput();
    }

    // Initially set the compliance status to the inferred value
    if (!this.complianceStatus && this.complianceStatusHint) {
      this.complianceStatus = this.complianceStatusHint;
    }
  }

  set complianceStatus(value: ComplianceStatus | null) {
    this.itemInput.compliance_status = value;
    if (!value) {
      // Preserve and remove the comment
      this._preservedComplianceComment =
        this.itemInput.compliance_comment ?? null;
      this.itemInput.compliance_comment = null;
    } else {
      // Restore the comment to the preserved one if no comment is set
      if (!this.itemInput.compliance_comment) {
        this.itemInput.compliance_comment = this._preservedComplianceComment;
      }
    }
  }

  get complianceStatus(): ComplianceStatus | null {
    return this.itemInput.compliance_status ?? null;
  }

  get complianceStatusHint(): ComplianceStatus | null {
    if (this._item instanceof Requirement) {
      return this._item.compliance_status_hint;
    } else {
      return null;
    }
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      if (this._item instanceof Requirement) {
        this._requirementService
          .updateRequirement(this._item.id, this.itemInput as IRequirementInput)
          .subscribe((requirement) => this._dialogRef.close(requirement));
      } else {
        this._measureService
          .updateMeasure(this._item.id, this.itemInput as IMeasureInput)
          .subscribe((measure) => this._dialogRef.close(measure));
      }
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
