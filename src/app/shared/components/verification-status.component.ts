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
import { MeasureInteractionService } from '../services/measure-interaction.service';

@Component({
  selector: 'mvtool-verification-status',
  template: `
    <div class="indicator">
      <button
        mat-button
        [color]="measure.verificationStatusColor"
        (click)="
          measureInteractions.onEditVerification(measure);
          $event.stopImmediatePropagation()
        "
        matTooltip="Click to edit verification status"
      >
        <mat-icon *ngIf="measure.verified">check</mat-icon>
        <mat-icon *ngIf="!measure.verified">close</mat-icon>
        {{ measure.verification_status ?? 'not set' | titlecase }}
      </button>
    </div>
  `,
  styles: [],
})
export class VerificationStatusComponent {
  @Input() measure!: Measure;

  constructor(readonly measureInteractions: MeasureInteractionService) {}
}
