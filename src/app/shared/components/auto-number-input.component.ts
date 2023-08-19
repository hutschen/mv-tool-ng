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

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface IAutoNumber {
  kind: 'number';
  start: number;
  step: number;
  prefix: string | null;
  suffix: string | null;
}

export function isAutoNumber(obj: any): obj is IAutoNumber {
  return (
    obj &&
    obj.kind === 'number' &&
    typeof obj.start === 'number' &&
    obj.start > 0 &&
    Number.isInteger(obj.start) &&
    typeof obj.step === 'number' &&
    obj.step > 0 &&
    Number.isInteger(obj.step) &&
    (typeof obj.prefix === 'string' || obj.prefix === null) &&
    (typeof obj.suffix === 'string' || obj.suffix === null)
  );
}

@Component({
  selector: 'mvtool-auto-number-input',
  template: `
    <div class="fx-column" [formGroup]="autoNumberForm">
      <div class="fx-row fx-gap-15 hint-space">
        <mat-form-field class="fx-grow">
          <mat-label>Start</mat-label>
          <input matInput formControlName="start" required />
          <mat-hint> First number </mat-hint>
          <mat-error *ngIf="_startCtrl.hasError('pattern')">
            {{ _validationMessage }}
          </mat-error>
        </mat-form-field>
        <mat-form-field class="fx-grow">
          <mat-label>Step</mat-label>
          <input matInput formControlName="step" required />
          <mat-hint> Increment </mat-hint>
          <mat-error *ngIf="_stepCtrl.hasError('pattern')">
            {{ _validationMessage }}
          </mat-error>
        </mat-form-field>
      </div>
      <div class="fx-row fx-gap-15 hint-space">
        <mat-form-field class="fx-grow">
          <mat-label>Prefix</mat-label>
          <input matInput formControlName="prefix" />
          <mat-hint>Text before number</mat-hint>
        </mat-form-field>
        <mat-form-field class="fx-grow">
          <mat-label>Suffix</mat-label>
          <input matInput formControlName="suffix" />
          <mat-hint>Text after number</mat-hint>
        </mat-form-field>
      </div>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['.hint-space { margin-bottom: 8px; }'],
})
export class AutoNumberInputComponent implements OnInit {
  protected readonly _validationMessage = 'Must be a number > 0.';
  protected _startCtrl!: FormControl<number | null>;
  protected _stepCtrl!: FormControl<number | null>;
  protected readonly _autoNumber: IAutoNumber = {
    kind: 'number',
    start: 1,
    step: 1,
    prefix: null,
    suffix: null,
  };
  autoNumberForm!: FormGroup;

  constructor() {}

  ngOnInit(): void {
    // Define form controls
    const validateNumber = Validators.pattern(/^[1-9]\d*$/);
    this._startCtrl = new FormControl(this._autoNumber.start, [
      Validators.required,
      validateNumber,
    ]);
    this._stepCtrl = new FormControl(this._autoNumber.step, [
      Validators.required,
      validateNumber,
    ]);
    const prefixCtrl = new FormControl<string | null>(this._autoNumber.prefix);
    const suffixCtrl = new FormControl<string | null>(this._autoNumber.suffix);

    // Define form group
    this.autoNumberForm = new FormGroup({
      start: this._startCtrl,
      step: this._stepCtrl,
      prefix: prefixCtrl,
      suffix: suffixCtrl,
    });
  }
}
