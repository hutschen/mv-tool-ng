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
import {
  IToVerifyItem,
  IVerificationInteractionService,
  VerificationStatus,
} from '../verification';
import { VerificationStatusOptions } from '../data/custom/custom-options';
import { OptionValue } from '../data/options';

@Component({
  selector: 'mvtool-verification-status',
  template: `
    <mvtool-loading-overlay [isLoading]="isLoading">
      <div class="indicator">
        <button
          mat-button
          [matMenuTriggerFor]="menu"
          [color]="verificationStatusColor"
          (click)="$event.stopImmediatePropagation()"
          matTooltip="Click to edit verification status"
          [disabled]="!toVerifyItem.verification_method || isLoading"
        >
          <mat-icon *ngIf="toVerifyItem.verified">check</mat-icon>
          <mat-icon *ngIf="!toVerifyItem.verified">close</mat-icon>
          {{ toVerifyItem.verification_status ?? 'not set' | titlecase }}
        </button>
      </div>
    </mvtool-loading-overlay>
    <mat-menu #menu="matMenu">
      <button
        mat-menu-item
        *ngFor="let option of verificationStatusOptions.filterOptions() | async"
        (click)="onSetVerificationStatus(option.value)"
      >
        {{ option.label }}
      </button>
      <mat-divider></mat-divider>
      <button
        mat-menu-item
        (click)="verificationInteractions.onEditVerification(toVerifyItem)"
      >
        Edit Verification
      </button>
    </mat-menu>
  `,
  styles: [],
})
export class VerificationStatusComponent {
  @Input() toVerifyItem!: IToVerifyItem;
  @Input() verificationInteractions!: IVerificationInteractionService;
  verificationStatusOptions = new VerificationStatusOptions(false);
  isLoading = false;

  constructor() {}

  get verificationStatusColor(): string | null {
    switch (this.toVerifyItem.verification_status) {
      case 'verified':
        return 'primary';
      case 'partially verified':
        return 'accent';
      case 'not verified':
        return 'warn';
      default:
        return null;
    }
  }

  async onSetVerificationStatus(value: OptionValue) {
    this.isLoading = true;
    try {
      await this.verificationInteractions.onSetVerificationStatus(
        this.toVerifyItem,
        value as VerificationStatus
      );
    } finally {
      this.isLoading = false;
    }
  }
}
