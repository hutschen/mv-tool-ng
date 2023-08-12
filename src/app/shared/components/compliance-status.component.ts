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
import { ComplianceStatusOptions } from '../data/custom/custom-options';
import { OptionValue } from '../data/options';
import {
  ComplianceInteractionService,
  ComplianceStatus,
  ICompliantItem,
} from '../compliance-interaction';

@Component({
  selector: 'mvtool-compliance-status',
  template: `
    <button
      mat-button
      [matMenuTriggerFor]="menu"
      (click)="$event.stopImmediatePropagation()"
    >
      {{ item.compliance_status ?? 'Not Set' }}
    </button>
    <mat-menu #menu="matMenu">
      <button
        mat-menu-item
        *ngFor="let option of complianceStatusOptions.filterOptions() | async"
        (click)="onSetComplianceStatus(item, option.value)"
      >
        {{ option.label }}
      </button>
      <mat-divider></mat-divider>
      <button
        mat-menu-item
        (click)="complianceInteractions.onEditCompliance(item)"
      >
        Edit Compliance
      </button>
    </mat-menu>
  `,
  styles: [],
})
export class ComplianceStatusComponent {
  @Input() item!: ICompliantItem;
  @Input() complianceInteractions!: ComplianceInteractionService;
  complianceStatusOptions = new ComplianceStatusOptions(false);

  constructor() {}

  onSetComplianceStatus(item: ICompliantItem, value: OptionValue) {
    this.complianceInteractions.onSetComplianceStatus(
      item,
      value as ComplianceStatus
    );
  }
}
