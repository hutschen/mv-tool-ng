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
  VerificationMethod,
} from '../verification';
import { VerificationMethodOptions } from '../data/custom/custom-options';
import { OptionValue } from '../data/options';

@Component({
  selector: 'mvtool-verification-method',
  template: `
    <mvtool-loading-overlay [isLoading]="isLoading">
      <button
        mat-button
        [matMenuTriggerFor]="menu"
        (click)="$event.stopImmediatePropagation()"
      >
        {{ toVerifyItem.verification_method ?? 'not set' | titlecase }}
      </button>
    </mvtool-loading-overlay>
    <mat-menu #menu="matMenu">
      <button
        mat-menu-item
        *ngFor="let option of verificationMethodOptions.filterOptions() | async"
        (click)="onSetVerificationMethod(option.value)"
        [disabled]="isLoading"
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
export class VerificationMethodComponent {
  @Input() toVerifyItem!: IToVerifyItem;
  @Input() verificationInteractions!: IVerificationInteractionService;
  verificationMethodOptions = new VerificationMethodOptions(false);
  isLoading = false;

  constructor() {}

  async onSetVerificationMethod(value: OptionValue) {
    this.isLoading = true;
    try {
      this.verificationInteractions.onSetVerificationMethod(
        this.toVerifyItem,
        value as VerificationMethod
      );
    } finally {
      this.isLoading = false;
    }
  }
}
