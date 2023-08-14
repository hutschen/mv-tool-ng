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

import { Component, Input } from '@angular/core';
import { Measure } from '../services/measure.service';
import { VerificationMethod } from '../verification';
import { MeasureInteractionService } from '../services/measure-interaction.service';
import { VerificationMethodOptions } from '../data/custom/custom-options';
import { OptionValue } from '../data/options';

@Component({
  selector: 'mvtool-verification-method',
  template: `
    <button
      mat-button
      [matMenuTriggerFor]="menu"
      (click)="$event.stopImmediatePropagation()"
    >
      {{ measure.verification_method ?? 'not set' | titlecase }}
    </button>
    <mat-menu #menu="matMenu">
      <button
        mat-menu-item
        *ngFor="let option of verificationMethodOptions.filterOptions() | async"
        (click)="onSetVerificationMethod(measure, option.value)"
      >
        {{ option.label }}
      </button>
      <mat-divider></mat-divider>
      <button
        mat-menu-item
        (click)="measureInteractions.onEditVerification(measure)"
      >
        Edit Verification
      </button>
    </mat-menu>
  `,
  styles: [],
})
export class VerificationMethodComponent {
  @Input() measure!: Measure;
  verificationMethodOptions = new VerificationMethodOptions(false);

  constructor(readonly measureInteractions: MeasureInteractionService) {}

  onSetVerificationMethod(measure: Measure, value: OptionValue) {
    this.measureInteractions.onSetVerificationMethod(
      measure,
      value as VerificationMethod
    );
  }
}
