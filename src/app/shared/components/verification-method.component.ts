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
  selector: 'mvtool-verification-method',
  template: `
    <button
      mat-button
      matTooltip="Click to set verification status"
      (click)="
        measureInteractions.onEditVerification(measure);
        $event.stopImmediatePropagation()
      "
    >
      {{ measure.verification_method ?? 'not set' | titlecase }}
    </button>
  `,
  styles: [],
})
export class VerificationMethodComponent {
  @Input() measure!: Measure;

  constructor(readonly measureInteractions: MeasureInteractionService) {}
}
