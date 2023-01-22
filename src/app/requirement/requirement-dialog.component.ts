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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { firstValueFrom, map, Observable } from 'rxjs';
import { MilestoneService } from '../shared/services/milestone.service';
import { Project } from '../shared/services/project.service';
import {
  IRequirementInput,
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { TargetObjectService } from '../shared/services/target-object.service';

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
  styles: ['textarea { min-height: 100px; }'],
})
export class RequirementDialogComponent implements OnInit {
  project: Project;
  targetObjects!: string[];
  milestones!: string[];
  requirementInput: IRequirementInput = {
    summary: '',
  };

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
  }

  async ngOnInit(): Promise<void> {
    this.targetObjects = await firstValueFrom(
      this._targetObjectService.getTargetObjects({
        project_ids: [this.project.id],
      })
    );

    this.milestones = await firstValueFrom(
      this._milestoneService.getMilestones({
        project_ids: [this.project.id],
      })
    );
  }

  get createMode(): boolean {
    return !this._dialogData.requirement;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
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
      requirement$.subscribe((requirement) =>
        this._dialogRef.close(requirement)
      );
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
