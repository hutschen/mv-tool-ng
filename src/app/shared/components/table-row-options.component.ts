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

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mvtool-table-row-options',
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
        <!-- Edit -->
        <button *ngIf="edit.observed" mat-menu-item (click)="edit.emit()">
          <mat-icon>edit_note</mat-icon>
          Edit
        </button>

        <!-- Special options container -->
        <ng-container *ngIf="hasSpecialOptions">
          <mat-divider></mat-divider>

          <!-- Toggle marker -->
          <ng-container *ngIf="toggleMarker.observed">
            <button mat-menu-item (click)="toggleMarker.emit()">
              <span *ngIf="!isMarked">
                <mat-icon>bookmark_add</mat-icon>
                Set marker
              </span>
              <span *ngIf="isMarked">
                <mat-icon>bookmark_remove</mat-icon>
                Remove marker
              </span>
            </button>
          </ng-container>

          <!-- Edit compliance -->
          <button
            *ngIf="editCompliance.observed"
            mat-menu-item
            (click)="editCompliance.emit()"
          >
            <mat-icon>assured_workload</mat-icon>
            Edit compliance
          </button>

          <!-- Edit completion -->
          <button
            *ngIf="editCompletion.observed"
            mat-menu-item
            (click)="editCompletion.emit()"
          >
            <mat-icon>check_circle</mat-icon>
            Edit completion
          </button>

          <!-- Edit verification -->
          <button
            *ngIf="editVerification.observed"
            mat-menu-item
            (click)="editVerification.emit()"
          >
            <mat-icon>verified</mat-icon>
            Edit verification
          </button>

          <mat-divider></mat-divider>
        </ng-container>

        <ng-content></ng-content>

        <!-- Delete -->
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
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class TableRowOptionsComponent {
  @Output() edit = new EventEmitter<void>();
  @Output() editCompliance = new EventEmitter<void>();
  @Output() editCompletion = new EventEmitter<void>();
  @Output() editVerification = new EventEmitter<void>();
  @Output() toggleMarker = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Input() isMarked: boolean = false;

  constructor() {}

  get hasSpecialOptions(): boolean {
    return (
      this.editCompliance.observed ||
      this.editCompletion.observed ||
      this.editVerification.observed ||
      this.toggleMarker.observed
    );
  }
}
