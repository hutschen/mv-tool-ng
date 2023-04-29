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
import { ComplianceStatusOptions } from '../data/custom/custom-options';
import { MeasureInteractionService } from '../services/measure-interaction.service';
import { OptionValue } from '../data/options';

@Component({
  selector: 'mvtool-compliance-status',
  template: `
    <button
      mat-button
      matTooltip="Click to set compliance status"
      (click)="
        measureInteractions.onEditCompliance(measure);
        $event.stopImmediatePropagation()
      "
    >
      {{ measure.compliance_status ?? 'Not Set' }}
    </button>
  `,
  styles: [],
})
export class ComplianceStatusComponent {
  @Input() measure!: Measure;
  complianceStatusOptions = new ComplianceStatusOptions(false);

  constructor(readonly measureInteractions: MeasureInteractionService) {}

  onSetComplianceStatus(measure: Measure, value: OptionValue | null) {}
}
