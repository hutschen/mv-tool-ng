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

import { Component, Inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable, finalize, firstValueFrom } from 'rxjs';
import { MilestoneService } from '../shared/services/milestone.service';
import { Project } from '../shared/services/project.service';
import {
  IRequirementInput,
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { TargetObjectService } from '../shared/services/target-object.service';
import {
  MilestoneOptions,
  TargetObjectOptions,
} from '../shared/data/requirement/requirement-options';

export interface IRequirementDialogData {
  project: Project;
  requirement?: Requirement;
}

@Injectable({
  providedIn: 'root',
})
export class RequirementDialogService {
  constructor(protected _dialog: MatDialog) {}

  openRequirementDialog(
    project: Project,
    requirement?: Requirement
  ): MatDialogRef<RequirementDialogComponent, Requirement> {
    return this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: { project, requirement },
    });
  }
}

@Component({
  selector: 'mvtool-requirement-dialog',
  templateUrl: './requirement-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['.description-input { min-height: 100px; }'],
})
export class RequirementDialogComponent {
  project: Project;
  targetObjectOptions: TargetObjectOptions;
  milestoneOptions: MilestoneOptions;
  requirementInput: IRequirementInput = {
    summary: '',
  };
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<RequirementDialogComponent>,
    protected _requirementService: RequirementService,
    protected _targetObjectService: TargetObjectService,
    protected _milestoneService: MilestoneService,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IRequirementDialogData
  ) {
    this.project = this._dialogData.project;
    if (this._dialogData.requirement) {
      this.requirementInput = this._dialogData.requirement.toRequirementInput();
    }

    this.targetObjectOptions = new TargetObjectOptions(
      this._targetObjectService,
      this.project,
      false
    );

    this.milestoneOptions = new MilestoneOptions(
      this._milestoneService,
      this.project,
      false
    );
  }

  get createMode(): boolean {
    return !this._dialogData.requirement;
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      // Define observable to create or update requirement
      let requirement$: Observable<Requirement>;
      if (!this._dialogData.requirement) {
        requirement$ = this._requirementService.createRequirement(
          this.project.id,
          this.requirementInput
        );
      } else {
        requirement$ = this._requirementService.updateRequirement(
          this._dialogData.requirement.id,
          this.requirementInput
        );
      }

      // Perform action and close dialog
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          requirement$.pipe(
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
    this._dialogRef.close(null);
  }
}
