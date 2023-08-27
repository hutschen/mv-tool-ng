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

import { Component, OnInit, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';

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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoNumberInputComponent),
      multi: true,
    },
  ],
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
export class AutoNumberInputComponent implements OnInit, ControlValueAccessor {
  protected readonly _validationMessage = 'Must be a number > 0.';
  protected _startCtrl!: FormControl<number | null>;
  protected _stepCtrl!: FormControl<number | null>;
  protected readonly _defaultValue = {
    start: null,
    step: null,
    prefix: null,
    suffix: null,
  };
  autoNumberForm!: FormGroup;

  // For ControlValueAccessor
  protected _onChange: (_: any) => void = () => {};
  protected _onTouched: () => void = () => {};

  constructor() {}

  ngOnInit(): void {
    // Define form controls
    const validateNumber = Validators.pattern(/^[1-9]\d*$/);
    this._startCtrl = new FormControl(this._defaultValue.start, [
      Validators.required,
      validateNumber,
    ]);
    this._stepCtrl = new FormControl(this._defaultValue.step, [
      Validators.required,
      validateNumber,
    ]);

    // Define form group
    this.autoNumberForm = new FormGroup({
      start: this._startCtrl,
      step: this._stepCtrl,
      prefix: new FormControl(this._defaultValue.prefix),
      suffix: new FormControl(this._defaultValue.suffix),
    });

    // Call onTouched and onChange when form value changes
    this.autoNumberForm.valueChanges.subscribe((value) => {
      this._onTouched();
      if (this.autoNumberForm.valid) {
        this._onChange({
          kind: 'number',
          start: Number(value.start),
          step: Number(value.step),
          prefix: value.prefix || null,
          suffix: value.suffix || null,
        });
      } else {
        this._onChange(null);
      }
    });
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(obj: any): void {
    if (isAutoNumber(obj)) {
      this.autoNumberForm.setValue(
        {
          start: obj.start,
          step: obj.step,
          prefix: obj.prefix,
          suffix: obj.suffix,
        },
        { emitEvent: false }
      );
    } else {
      this.autoNumberForm.setValue(this._defaultValue, { emitEvent: false });
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.autoNumberForm.disable({ emitEvent: false });
    else this.autoNumberForm.enable({ emitEvent: false });
  }
}
