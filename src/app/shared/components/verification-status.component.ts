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
import { Measure, VerificationStatus } from '../services/measure.service';
import { MeasureInteractionService } from '../services/measure-interaction.service';
import { VerificationStatusOptions } from '../data/custom/custom-options';
import { OptionValue } from '../data/options';

@Component({
  selector: 'mvtool-verification-status',
  template: `
    <div class="indicator">
      <button
        mat-button
        [matMenuTriggerFor]="menu"
        [color]="measure.verificationStatusColor"
        (click)="$event.stopImmediatePropagation()"
        matTooltip="Click to edit verification status"
      >
        <mat-icon *ngIf="measure.verified">check</mat-icon>
        <mat-icon *ngIf="!measure.verified">close</mat-icon>
        {{ measure.verification_status ?? 'not set' | titlecase }}
      </button>
      <mat-menu #menu="matMenu">
        <button
          mat-menu-item
          *ngFor="
            let option of verificationStatusOptions.filterOptions() | async
          "
          (click)="onSetVerificationStatus(measure, option.value)"
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
    </div>
  `,
  styles: [],
})
export class VerificationStatusComponent {
  @Input() measure!: Measure;
  verificationStatusOptions = new VerificationStatusOptions(false);

  constructor(readonly measureInteractions: MeasureInteractionService) {}

  onSetVerificationStatus(measure: Measure, value: OptionValue) {
    this.measureInteractions.onSetVerificationStatus(
      measure,
      value as VerificationStatus
    );
  }
}
