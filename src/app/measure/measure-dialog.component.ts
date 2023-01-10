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
import { Observable } from 'rxjs';
import {
  IMeasureInput,
  Measure,
  MeasureService,
} from '../shared/services/measure.service';
import { Requirement } from '../shared/services/requirement.service';

export interface IMeasureDialogData {
  requirement: Requirement;
  measure?: Measure;
}

@Injectable({
  providedIn: 'root',
})
export class MeasureDialogService {
  constructor(protected _dialog: MatDialog) {}

  openMeasureDialog(
    requirement: Requirement,
    measure?: Measure
  ): MatDialogRef<MeasureDialogComponent, Measure> {
    return this._dialog.open(MeasureDialogComponent, {
      width: '500px',
      data: { requirement, measure },
    });
  }
}

@Component({
  selector: 'mvtool-measure-dialog',
  templateUrl: './measure-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class MeasureDialogComponent {
  requirement: Requirement;
  measureInput: IMeasureInput = {
    summary: '',
    description: null,
    verified: false,
    jira_issue_id: null,
    document_id: null,
  };

  constructor(
    protected _dialogRef: MatDialogRef<MeasureDialogComponent>,
    protected _measureService: MeasureService,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IMeasureDialogData
  ) {
    this.requirement = this._dialogData.requirement;
    if (this._dialogData.measure) {
      this.measureInput = this._dialogData.measure.toMeasureInput();
    }
  }

  get createMode(): boolean {
    return !this._dialogData.measure;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      let measure$: Observable<Measure>;
      if (!this._dialogData.measure) {
        measure$ = this._measureService.createMeasure(
          this.requirement.id,
          this.measureInput
        );
      } else {
        measure$ = this._measureService.updateMeasure(
          this._dialogData.measure.id,
          this.measureInput
        );
      }
      measure$.subscribe((measure) => this._dialogRef.close(measure));
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
