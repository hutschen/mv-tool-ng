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
import { Project } from '../shared/services/project.service';
import {
  IRequirementInput,
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';

export interface IRequirementDialogData {
  project: Project;
  requirement: Requirement | null;
}

@Component({
  selector: 'mvtool-requirement-dialog',
  templateUrl: './requirement-dialog.component.html',
  styles: ['textarea { min-height: 100px; }'],
})
export class RequirementDialogComponent {
  project: Project;
  requirementInput: IRequirementInput = {
    summary: '',
  };

  constructor(
    protected _dialogRef: MatDialogRef<RequirementDialogComponent>,
    protected _requirementService: RequirementService,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IRequirementDialogData
  ) {
    this.project = this._dialogData.project;
    if (this._dialogData.requirement) {
      this.requirementInput = this._dialogData.requirement.toRequirementInput();
    }
  }

  get createMode(): boolean {
    return !this._dialogData.requirement;
  }

  async onSave(form: NgForm): Promise<void> {
    if (form.valid) {
      let requirement: Requirement;
      if (!this._dialogData.requirement) {
        requirement = await this._requirementService.createRequirement(
          this.project.id,
          this.requirementInput
        );
      } else {
        requirement = await this._requirementService.updateRequirement(
          this._dialogData.requirement.id,
          this.requirementInput
        );
      }
      this._dialogRef.close(requirement);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
