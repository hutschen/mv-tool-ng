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

import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'mvtool-file-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="fx-row fx-gap-10" [formGroup]="fileForm">
      <!-- Input to show name of selected file -->
      <mat-form-field appearance="fill" class="fx-grow">
        <mat-label>Filename</mat-label>
        <input
          matInput
          readonly="true"
          formControlName="filename"
          [required]="isRequired"
        />
      </mat-form-field>

      <!-- Button to open file dialog and hidden input to hold file -->
      <div class="fx-no-grow">
        <button
          mat-button
          type="button"
          (click)="fileInput.click()"
          [disabled]="fileForm.disabled"
        >
          <mat-icon>attach_file</mat-icon>
          Choose file
        </button>
        <input hidden type="file" #fileInput formControlName="file" />
      </div>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FileInputComponent implements OnInit, ControlValueAccessor {
  @ViewChild('fileInput') protected _fileInput!: ElementRef<HTMLInputElement>;
  fileForm!: FormGroup;

  // For ControlValueAccessor
  protected _onChange: (value: File | null) => void = () => {};
  protected _onTouched: () => void = () => {};

  constructor(protected _element: ElementRef) {}

  ngOnInit(): void {
    const filenameCtrl = new FormControl<string | null>(null);
    const fileCtrl = new FormControl(null);

    this.fileForm = new FormGroup({
      filename: filenameCtrl,
      file: fileCtrl,
    });

    // Update filename, onTouched and onChange when file is selected
    fileCtrl.valueChanges.subscribe(() => {
      this._onTouched();
      const files = this._fileInput.nativeElement.files;
      if (files && files.length > 0) {
        const file = files[0];
        filenameCtrl.setValue(file.name);
        this._onChange(file);
      } else {
        filenameCtrl.setValue(null);
        this._onChange(null);
      }
    });
  }

  get isRequired(): boolean {
    return this._element.nativeElement.hasAttribute('required');
  }

  writeValue(obj: any): void {
    // Setting a file programmatically is not currently supported
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.fileForm.disable({ emitEvent: false });
    else this.fileForm.enable({ emitEvent: false });
  }
}
