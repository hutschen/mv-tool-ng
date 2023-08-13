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
  CompletionStatus,
  ICompletionInteractionService,
  IToCompleteItem,
} from '../completion';
import { CompletionStatusOptions } from '../data/custom/custom-options';
import { OptionValue } from '../data/options';

@Component({
  selector: 'mvtool-completion-status',
  template: `
    <div class="indicator">
      <button
        mat-button
        [matMenuTriggerFor]="menu"
        [color]="completionStatusColor"
        (click)="$event.stopImmediatePropagation()"
      >
        <mat-icon *ngIf="toCompleteItem.completed">check</mat-icon>
        <mat-icon *ngIf="!toCompleteItem.completed">close</mat-icon>
        {{ toCompleteItem.completion_status ?? 'not set' | titlecase }}
      </button>
      <mat-menu #menu="matMenu">
        <button
          mat-menu-item
          *ngFor="let option of completionStatusOptions.filterOptions() | async"
          (click)="onSetCompletionStatus(toCompleteItem, option.value)"
        >
          {{ option.label }}
        </button>
        <mat-divider></mat-divider>
        <button
          mat-menu-item
          (click)="completionInteractions.onEditCompletion(toCompleteItem)"
        >
          Edit Completion
        </button>
      </mat-menu>
    </div>
  `,
  styles: [],
})
export class CompletionStatusComponent {
  @Input() toCompleteItem!: IToCompleteItem;
  @Input() completionInteractions!: ICompletionInteractionService;
  completionStatusOptions = new CompletionStatusOptions(false);

  constructor() {}

  get completionStatusColor(): string | null {
    switch (this.toCompleteItem.completion_status) {
      case 'completed':
        return 'primary';
      case 'in progress':
        return 'accent';
      case 'open':
        return 'warn';
      default:
        return null;
    }
  }

  onSetCompletionStatus(toCompleteItem: IToCompleteItem, value: OptionValue) {
    this.completionInteractions.onSetCompletionStatus(
      toCompleteItem,
      value as CompletionStatus
    );
  }
}
