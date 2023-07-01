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

import { Component } from '@angular/core';
import { CompletionStatusOptions } from '../data/custom/custom-options';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ICompletion {
  completion_status?: string | null;
  completion_comment?: string | null;
}

@Component({
  selector: 'mvtool-completion-input',
  template: `
    <div class="fx-column">
      <!-- Completion Status -->
      <mat-form-field appearance="fill">
        <mat-label>Select completion status</mat-label>
        <mat-select
          name="completionStatus"
          [(ngModel)]="value.completion_status"
          (ngModelChange)="updateChanges()"
          [disabled]="isDisabled"
        >
          <mat-option [value]="null">None</mat-option>
          <mat-option
            *ngFor="
              let option of completionStatusOptions.filterOptions() | async
            "
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Completion Comment -->
      <mat-form-field appearance="fill">
        <mat-label>Completion Comment</mat-label>
        <textarea
          name="completionComment"
          matInput
          [(ngModel)]="value.completion_comment"
          (ngModelChange)="updateChanges()"
          [disabled]="!value.completion_status || isDisabled"
        ></textarea>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CompletionInputComponent,
      multi: true,
    },
  ],
})
export class CompletionInputComponent implements ControlValueAccessor {
  readonly completionStatusOptions = new CompletionStatusOptions(false);
  value: ICompletion = {};
  preservedComment: string | null = null;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  writeValue(value: any): void {
    if (value) {
      this.value = value;
    } else {
      this.value = {};
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  updateChanges() {
    if (!this.value.completion_status) {
      // Preserve and remove the comment
      this.preservedComment = this.value.completion_comment ?? null;
      this.value.completion_comment = null;
    } else {
      // Restore the comment to the preserved comment if no comment is set
      if (!this.value.completion_comment) {
        this.value.completion_comment = this.preservedComment;
      }
    }

    this.onChange(this.value);
    this.onTouched();
  }
}
