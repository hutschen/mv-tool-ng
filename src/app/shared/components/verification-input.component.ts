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
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  VerificationMethod,
  VerificationStatus,
} from '../services/measure.service';
import {
  VerificationMethodOptions,
  VerificationStatusOptions,
} from '../data/custom/custom-options';

export interface IVerification {
  verification_method?: VerificationMethod | null;
  verification_status?: VerificationStatus | null;
  verification_comment?: string | null;
}

@Component({
  selector: 'mvtool-verification-input',
  template: `
    <div class="fx-column">
      <!-- Verification Method -->
      <mat-form-field appearance="fill">
        <mat-label>Select verification method</mat-label>
        <mat-select
          name="verificationMethod"
          [(ngModel)]="value.verification_method"
          (ngModelChange)="updateChanges()"
          [disabled]="isDisabled"
        >
          <mat-option [value]="null">None</mat-option>
          <mat-option
            *ngFor="
              let option of verificationMethodOptions.filterOptions() | async
            "
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Verification Status -->
      <mat-form-field appearance="fill">
        <mat-label>Select verification status</mat-label>
        <mat-select
          name="verificationStatus"
          [(ngModel)]="value.verification_status"
          (ngModelChange)="updateChanges()"
          [disabled]="!value.verification_method || isDisabled"
        >
          <mat-option [value]="null">None</mat-option>
          <mat-option
            *ngFor="
              let option of verificationStatusOptions.filterOptions() | async
            "
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Verification Comment -->
      <mat-form-field appearance="fill">
        <mat-label>Verification Comment</mat-label>
        <textarea
          name="verificationComment"
          matInput
          [(ngModel)]="value.verification_comment"
          (ngModelChange)="updateChanges()"
          [disabled]="!value.verification_method || isDisabled"
        ></textarea>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: VerificationInputComponent,
      multi: true,
    },
  ],
})
export class VerificationInputComponent implements ControlValueAccessor {
  readonly verificationMethodOptions = new VerificationMethodOptions(false);
  readonly verificationStatusOptions = new VerificationStatusOptions(false);
  value: IVerification = {};
  preservedStatus: VerificationStatus | null = null;
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
    if (!this.value.verification_method) {
      // Preserve and remove the status and comment
      this.preservedStatus = this.value.verification_status ?? null;
      this.preservedComment = this.value.verification_comment ?? null;
      this.value.verification_status = null;
      this.value.verification_comment = null;
    } else {
      // Restore the status and comment to the preserved ones if not set
      if (!this.value.verification_status) {
        this.value.verification_status = this.preservedStatus;
      }
      if (!this.value.verification_comment) {
        this.value.verification_comment = this.preservedComment;
      }
    }

    this.onChange(this.value);
    this.onTouched();
  }
}
