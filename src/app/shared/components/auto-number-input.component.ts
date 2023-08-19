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

@Component({
  selector: 'mvtool-auto-number-input',
  template: `
    <div class="fx-column" [formGroup]="autoNumberForm">
      <div class="fx-row fx-gap-15">
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
      <div class="fx-row fx-gap-15">
        <mat-form-field class="fx-grow">
          <mat-label>Prefix</mat-label>
          <input matInput formControlName="prefix" />
        </mat-form-field>
        <mat-form-field class="fx-grow">
          <mat-label>Suffix</mat-label>
          <input matInput formControlName="suffix" />
        </mat-form-field>
      </div>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class AutoNumberInputComponent implements OnInit {
  protected readonly _validationMessage = 'Must be a number > 0.';
  protected _startCtrl!: FormControl<number | null>;
  protected _stepCtrl!: FormControl<number | null>;
  autoNumberForm!: FormGroup;

  constructor() {}

  ngOnInit(): void {
    // Define form controls
    const validateNumber = Validators.pattern(/^[1-9]\d*$/);
    this._startCtrl = new FormControl(1, [Validators.required, validateNumber]);
    this._stepCtrl = new FormControl(1, [Validators.required, validateNumber]);
    const prefixCtrl = new FormControl<string | null>(null);
    const suffixCtrl = new FormControl<string | null>(null);

    // Define form group
    this.autoNumberForm = new FormGroup({
      start: this._startCtrl,
      step: this._stepCtrl,
      prefix: prefixCtrl,
      suffix: suffixCtrl,
    });
  }
}
