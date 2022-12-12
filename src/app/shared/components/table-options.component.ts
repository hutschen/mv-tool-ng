// Copyright (C) 2022 Helmar Hutschenreuter
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

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'mvtool-table-options',
  template: `
    <div class="fx-row fx-end-center">
      <button
        mat-icon-button
        [matMenuTriggerFor]="menu"
        (click)="$event.stopPropagation()"
        aria-label="Show options"
      >
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button *ngIf="edit.observed" mat-menu-item (click)="edit.emit()">
          <mat-icon>edit_note</mat-icon>
          Edit
        </button>
        <button
          *ngIf="delete.observed"
          mat-menu-item
          color="warn"
          (click)="delete.emit()"
        >
          <mat-icon>delete</mat-icon>
          Delete
        </button>
      </mat-menu>
    </div>
  `,
  styleUrls: ['../styles/flex.css'],
  styles: [],
})
export class TableOptionsComponent {
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  constructor() {}
}
