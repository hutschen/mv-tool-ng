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
import { CompletionStatusOptions } from '../data/custom/custom-options';

@Component({
  selector: 'mvtool-completion-status',
  template: `
    <div class="indicator">
      <button
        mat-button
        [matMenuTriggerFor]="menu"
        [color]="measure.completionStatusColor"
        (click)="$event.stopImmediatePropagation()"
      >
        <mat-icon *ngIf="measure.completed">check</mat-icon>
        <mat-icon *ngIf="!measure.completed">close</mat-icon>
        {{ measure.completion_status ?? 'not set' | titlecase }}
      </button>
      <mat-menu #menu="matMenu">
        <button
          mat-menu-item
          *ngFor="let option of completionStatusOptions.filterOptions() | async"
        >
          <mat-icon *ngIf="option.value === 'completed'">check</mat-icon>
          <mat-icon *ngIf="option.value !== 'completed'">close</mat-icon>
          {{ option.label }}
        </button>
        <mat-divider></mat-divider>
        <button
          mat-menu-item
          (click)="measureInteractions.onEditCompletion(measure)"
        >
          <mat-icon>check_circle</mat-icon>
          Edit Completion
        </button>
      </mat-menu>
    </div>
  `,
  styles: [],
})
export class CompletionStatusComponent {
  @Input() measure!: Measure;
  completionStatusOptions = new CompletionStatusOptions(false);

  constructor(readonly measureInteractions: MeasureInteractionService) {}
}
