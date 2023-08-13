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
import { ComplianceStatusOptions } from '../data/custom/custom-options';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComplianceStatus } from '../compliance';

export interface ICompliance {
  compliance_status?: ComplianceStatus | null; // TODO: move definition of ComplianceStatus to this file
  compliance_comment?: string | null;
}

@Component({
  selector: 'mvtool-compliance-input',
  template: `
    <div class="fx-column">
      <!-- Compliance Status Input -->
      <mat-form-field appearance="fill">
        <mat-label>Select compliance status</mat-label>
        <mat-select
          name="complianceStatus"
          [(ngModel)]="value.compliance_status"
          (ngModelChange)="updateChanges()"
          [disabled]="isDisabled"
        >
          <mat-option [value]="null">None</mat-option>
          <mat-option
            *ngFor="
              let option of complianceStatusOptions.filterOptions() | async
            "
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Compliance Comment Input -->
      <mat-form-field appearance="fill">
        <mat-label>Compliance Comment</mat-label>
        <textarea
          name="complianceComment"
          matInput
          [(ngModel)]="value.compliance_comment"
          (ngModelChange)="updateChanges()"
          [disabled]="!value.compliance_status || isDisabled"
        ></textarea>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ComplianceInputComponent,
      multi: true,
    },
  ],
})
export class ComplianceInputComponent implements ControlValueAccessor {
  readonly complianceStatusOptions = new ComplianceStatusOptions(false);
  value: ICompliance = {};
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
    if (!this.value.compliance_status) {
      // Preserve and remove the comment
      this.preservedComment = this.value.compliance_comment ?? null;
      this.value.compliance_comment = null;
    } else {
      // Restore the comment to the preserved comment if no comment is set
      if (!this.value.compliance_comment) {
        this.value.compliance_comment = this.preservedComment;
      }
    }

    this.onChange(this.value);
    this.onTouched();
  }
}
