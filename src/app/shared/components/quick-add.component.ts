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
import { Observable, finalize, firstValueFrom } from 'rxjs';

export interface IQuickAddService<T> {
  create(value: string): Observable<T>;
}

@Component({
  selector: 'mvtool-quick-add',
  template: `
    <div class="fx-column">
      <mat-form-field>
        <input
          matInput
          [placeholder]="placeholder"
          (keyup.enter)="onCreate()"
          [(ngModel)]="value"
        />
        <mvtool-loading-overlay
          [isLoading]="isCreating"
          color="primary"
          matSuffix
        >
          <button
            class="create-button"
            mat-flat-button
            color="primary"
            (click)="onCreate()"
            [disabled]="!value || isCreating"
          >
            <mat-icon>add</mat-icon>
            {{ createLabel }}
          </button>
        </mvtool-loading-overlay>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['.create-button { margin-right: 8px; }'],
})
export class QuickAddComponent<T> {
  value = '';
  isCreating = false;
  @Input() placeholder = 'Start typing ...';
  @Input() createLabel = 'Create';
  @Input() quickAddService!: IQuickAddService<T>;

  async onCreate() {
    if (this.isCreating) return;

    // Save current value by creating the create$ observable
    const create$ = this.quickAddService.create(this.value);
    this.value = '';

    this.isCreating = true;
    await firstValueFrom(
      create$.pipe(finalize(() => (this.isCreating = false)))
    );
  }
}
