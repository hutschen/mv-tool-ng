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
import {
  IMeasureInput,
  Measure,
  MeasureService,
  VerificationMethod,
} from '../shared/services/measure.service';

@Injectable({
  providedIn: 'root',
})
export class VerificationDialogService {
  constructor(protected _dialog: MatDialog) {}

  openVerificationDialog(
    measure: Measure
  ): MatDialogRef<VerificationDialogComponent, Measure> {
    const dialogRef = this._dialog.open(VerificationDialogComponent, {
      width: '500px',
      data: measure,
    });
    return dialogRef;
  }
}

@Component({
  selector: 'mvtool-verification-dialog',
  template: `
    <mvtool-create-edit-dialog
      [createMode]="false"
      objectName="Verification Status"
      (save)="onSave($event)"
      (cancel)="onCancel()"
    >
      <div class="fx-column">
        <!-- Verification method -->
        <mat-form-field appearance="fill">
          <mat-label>Verification method</mat-label>
          <mat-select
            name="verificationMethod"
            [(ngModel)]="verificationMethod"
          >
            <mat-option [value]="null">None</mat-option>
            <mat-option
              *ngFor="let method of verificationMethods"
              [value]="method"
            >
              {{ method }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Verification status -->
        <mat-form-field appearance="fill">
          <mat-label>Verification status</mat-label>
          <mat-select
            name="verificationStatus"
            [(ngModel)]="measureInput.verification_status"
            [disabled]="!verificationMethod"
          >
            <mat-option [value]="null">None</mat-option>
            <mat-option
              *ngFor="let status of verificationStatuses"
              [value]="status"
            >
              {{ status | titlecase }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Verification comment -->
        <mat-form-field appearance="fill">
          <mat-label>Verification comment</mat-label>
          <textarea
            matInput
            name="verificationComment"
            [(ngModel)]="measureInput.verification_comment"
            [disabled]="!verificationMethod"
          ></textarea>
        </mat-form-field>
      </div>
    </mvtool-create-edit-dialog>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class VerificationDialogComponent {
  verificationMethods = ['R', 'T', 'I'];
  verificationStatuses = ['verified', 'partially verified', 'not verified'];
  measureInput: IMeasureInput;

  constructor(
    protected _dialogRef: MatDialogRef<VerificationDialogComponent>,
    protected _measureService: MeasureService,
    @Inject(MAT_DIALOG_DATA) protected _measure: Measure
  ) {
    this.measureInput = this._measure.toMeasureInput();
  }

  set verificationMethod(value: VerificationMethod | null) {
    this.measureInput.verification_method = value;
    if (!value) {
      this.measureInput.verification_status = null;
      this.measureInput.verification_comment = null;
    }
  }

  get verificationMethod(): VerificationMethod | null {
    return this.measureInput.verification_method ?? null;
  }

  onSave(form: NgForm): void {
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
