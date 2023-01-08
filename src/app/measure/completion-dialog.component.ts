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
} from '../shared/services/measure.service';

@Injectable({
  providedIn: 'root',
})
export class CompletionDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCompletionDialog(
    measure: Measure
  ): MatDialogRef<CompletionDialogComponent, Measure> {
    const dialogRef = this._dialog.open(CompletionDialogComponent, {
      width: '500px',
      data: measure,
    });
    return dialogRef;
  }
}

@Component({
  selector: 'mvtool-completion-dialog',
  template: `
    <mvtool-create-edit-dialog
      [createMode]="false"
      objectName="Completion"
      (save)="onSave($event)"
      (cancel)="onCancel()"
    >
      <div class="fx-column">
        <!-- Completion status -->
        <mat-form-field appearance="fill">
          <mat-label>Select completion status</mat-label>
          <mat-select name="completionStatus" [(ngModel)]="completionStatus">
            <mat-option [value]="null">None</mat-option>
            <mat-option
              *ngFor="let completionStatus of completionStates"
              [value]="completionStatus"
            >
              {{ completionStatus | titlecase }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Completion comment -->
        <mat-form-field appearance="fill">
          <mat-label>Completion comment</mat-label>
          <textarea
            name="completionComment"
            matInput
            [(ngModel)]="measureInput.completion_comment"
            [disabled]="completionCommentDisabled"
          ></textarea>
        </mat-form-field>
      </div>
    </mvtool-create-edit-dialog>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class CompletionDialogComponent {
  completionStates = ['open', 'in progress', 'completed'];
  measureInput: IMeasureInput;

  constructor(
    protected _dialogRef: MatDialogRef<CompletionDialogComponent>,
    protected _measureService: MeasureService,
    @Inject(MAT_DIALOG_DATA) protected _measure: Measure
  ) {
    this.measureInput = this._measure.toMeasureInput();
  }

  get completionCommentDisabled(): boolean {
    return !this.measureInput.completion_status;
  }

  get completionStatus(): string | null {
    return this.measureInput.completion_status ?? null;
  }

  set completionStatus(value: string | null) {
    this.measureInput.completion_status = value;
    if (this.completionCommentDisabled) {
      this.measureInput.completion_comment = null;
    }
  }

  onSave(form: NgForm) {
    if (form.valid) {
      this._measureService
        .updateMeasure(this._measure.id, this.measureInput)
        .subscribe((measure) => this._dialogRef.close(measure));
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
