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
import { EncodingOptions } from '../data/encoding/encoding-options';
import { EncodingService } from '../services/encoding.service';

export interface ICsvSettings {
  encoding: string;
  delimiter: string;
}

export function isCsvSettings(obj: any): obj is ICsvSettings {
  return (
    obj &&
    typeof obj.encoding === 'string' &&
    typeof obj.delimiter === 'string' &&
    obj.delimiter.length === 1
  );
}

@Component({
  selector: 'mvtool-csv-settings-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CsvSettingsInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="fx-column" [formGroup]="csvSettingsForm">
      <!-- Encoding -->
      <mvtool-autocomplete
        formControlName="encoding"
        label="Encoding"
        [options]="_encodingOptions"
        required
      >
      </mvtool-autocomplete>

      <!-- Delimiter -->
      <mat-form-field appearance="fill">
        <mat-label>Delimiter</mat-label>
        <input formControlName="delimiter" matInput />
        <mat-error *ngIf="_invalidDelimiter">
          Delimiter must be a single character.
        </mat-error>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class CsvSettingsInputComponent implements OnInit, ControlValueAccessor {
  csvSettingsForm!: FormGroup;
  protected _encodingOptions!: EncodingOptions;
  protected _delimiterCtrl!: FormControl;
  protected readonly _defaultValue = {
    encoding: null,
    delimiter: null,
  };

  // For ControlValueAccessor
  protected _onChange: (_: ICsvSettings | null) => void = () => {};
  protected _onTouched: () => void = () => {};

  constructor(encodingService: EncodingService) {
    this._encodingOptions = new EncodingOptions(encodingService, false);
  }

  ngOnInit(): void {
    // Define form controls
    const encodingCtrl = new FormControl(
      this._defaultValue.encoding,
      Validators.required
    );
    this._delimiterCtrl = new FormControl(this._defaultValue.delimiter, [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(1),
    ]);

    // Define form group
    this.csvSettingsForm = new FormGroup({
      encoding: encodingCtrl,
      delimiter: this._delimiterCtrl,
    });

    // Call onTouched and onChange when form value changes
    this.csvSettingsForm.valueChanges.subscribe((value) => {
      this._onTouched();
      if (this.csvSettingsForm.valid) {
        this._onChange({
          encoding: value.encoding,
          delimiter: value.delimiter,
        });
      } else {
        this._onChange(null);
      }
    });
  }

  protected _invalidDelimiter(): boolean {
    return (
      this._delimiterCtrl.hasError('minlength') ||
      this._delimiterCtrl.hasError('maxlength')
    );
  }

  writeValue(obj: any): void {
    if (isCsvSettings(obj)) {
      this.csvSettingsForm.setValue(
        {
          encoding: obj.encoding,
          delimiter: obj.delimiter,
        },
        { emitEvent: false }
      );
    } else {
      this.csvSettingsForm.setValue(this._defaultValue, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.csvSettingsForm.disable({ emitEvent: false });
    else this.csvSettingsForm.enable({ emitEvent: false });
  }
}
