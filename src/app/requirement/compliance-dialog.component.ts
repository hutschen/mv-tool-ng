// Copyright (C) 2022 Helmar Hutschenreuter
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

import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  IRequirementInput,
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-compliance-dialog',
  templateUrl: './compliance-dialog.component.html',
  styleUrls: ['../shared/styles/flex.css'],
  styles: ['textarea { min-height: 100px; }'],
})
export class ComplianceDialogComponent {
  complianceStates = ['C', 'PC', 'NC', 'N/A'];
  requirementInput: IRequirementInput;

  constructor(
    protected _dialogRef: MatDialogRef<ComplianceDialogComponent>,
    protected _requirementService: RequirementService,
    @Inject(MAT_DIALOG_DATA) protected _requirement: Requirement
  ) {
    this.requirementInput = this._requirement.toRequirementInput();
  }

  get complianceCommentDisabled(): boolean {
    return !this.requirementInput.compliance_status;
  }

  set complianceStatus(value: string | null | undefined) {
    this.requirementInput.compliance_status = value;
    if (this.complianceCommentDisabled) {
      this.requirementInput.compliance_comment = null;
    }
  }

  get complianceStatus(): string | null | undefined {
    return this.requirementInput.compliance_status;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._requirementService
        .updateRequirement(this._requirement.id, this.requirementInput)
        .subscribe((requirement) => this._dialogRef.close(requirement));
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
