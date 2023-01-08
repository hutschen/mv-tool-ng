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
  IRequirementInput,
  Requirement,
  RequirementService,
} from '../services/requirement.service';

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
  complianceStates = ['C', 'PC', 'NC', 'N/A'];
  itemInput: IRequirementInput | IMeasureInput;

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
  }

  get complianceCommentDisabled(): boolean {
    return !this.itemInput.compliance_status;
  }

  set complianceStatus(value: string | null | undefined) {
    this.itemInput.compliance_status = value;
    if (this.complianceCommentDisabled) {
      this.itemInput.compliance_comment = null;
    }
  }

  get complianceStatus(): string | null | undefined {
    return this.itemInput.compliance_status;
  }

  get complianceStatusHint(): string | null {
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
