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
  IComplianceInteractionService,
  ComplianceStatus,
  ICompliantItem,
} from '../compliance';

@Component({
  selector: 'mvtool-compliance-status',
  template: `
    <mvtool-loading-overlay [isLoading]="isLoading">
      <button
        mat-button
        [matMenuTriggerFor]="menu"
        (click)="$event.stopImmediatePropagation()"
        [disabled]="isLoading"
      >
        {{ compliantItem.compliance_status ?? 'Not Set' }}
      </button>
    </mvtool-loading-overlay>
    <mat-menu #menu="matMenu">
      <button
        mat-menu-item
        *ngFor="let option of complianceStatusOptions.filterOptions() | async"
        (click)="onSetComplianceStatus(compliantItem, option.value)"
      >
        {{ option.label }}
      </button>
      <mat-divider></mat-divider>
      <button
        mat-menu-item
        (click)="complianceInteractions.onEditCompliance(compliantItem)"
      >
        Edit Compliance
      </button>
    </mat-menu>
  `,
  styles: [],
})
export class ComplianceStatusComponent {
  @Input() compliantItem!: ICompliantItem;
  @Input() complianceInteractions!: IComplianceInteractionService;
  complianceStatusOptions = new ComplianceStatusOptions(false);
  isLoading = false;

  constructor() {}

  async onSetComplianceStatus(
    compliantItem: ICompliantItem,
    value: OptionValue
  ) {
    this.isLoading = true;
    try {
      await this.complianceInteractions.onSetComplianceStatus(
        compliantItem,
        value as ComplianceStatus
      );
    } finally {
      this.isLoading = false;
    }
  }
}
