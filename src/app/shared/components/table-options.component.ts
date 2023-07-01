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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'mvtool-table-options',
  template: `
    <div *ngIf="enabled" class="fx-row fx-end-center">
      <button
        mat-icon-button
        [matMenuTriggerFor]="menu"
        (click)="$event.stopPropagation()"
        aria-label="Show table options"
      >
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button
          mat-menu-item
          *ngIf="hideColumns.observed"
          (click)="hideColumns.emit($event)"
          [disabled]="hideColumnsDisabled"
        >
          <mat-icon>visibility_off</mat-icon>
          Hide columns
        </button>
        <button
          mat-menu-item
          *ngIf="clearFilters.observed"
          [disabled]="clearFiltersDisabled"
          (click)="clearFilters.emit($event)"
        >
          <mat-icon>filter_alt_off</mat-icon>
          Clear all filters
        </button>
        <button
          mat-menu-item
          *ngIf="clearSort.observed"
          (click)="clearSort.emit($event)"
          [disabled]="clearSortDisabled"
        >
          <mat-icon>sort_off</mat-icon>
          Clear sort
        </button>
        <button
          mat-menu-item
          *ngIf="clearMarkers.observed"
          (click)="clearMarkers.emit($event)"
          [disabled]="clearMarkersDisabled"
        >
          <mat-icon>bookmark_remove</mat-icon>
          Clear markers
        </button>
        <ng-content></ng-content>

        <ng-container *ngIf="bulkDelete.observed">
          <mat-divider></mat-divider>
          <button
            mat-menu-item
            (click)="bulkDelete.emit($event)"
            [disabled]="bulkDeleteDisabled"
          >
            <mat-icon>delete</mat-icon>
            <span *ngIf="!isTableFiltered">Delete all</span>
            <span *ngIf="isTableFiltered">Delete filtered</span>
          </button>
        </ng-container>
      </mat-menu>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class TableOptionsComponent implements OnInit {
  @Output() hideColumns = new EventEmitter<Event>();
  @Output() clearFilters = new EventEmitter<Event>();
  @Output() clearSort = new EventEmitter<Event>();
  @Output() clearMarkers = new EventEmitter<Event>();
  @Output() bulkDelete = new EventEmitter<Event>();
  @Input() clearFiltersDisabled: boolean = false;
  @Input() clearSortDisabled: boolean = false;
  @Input() hideColumnsDisabled: boolean = false;
  @Input() clearMarkersDisabled: boolean = false;
  @Input() bulkDeleteDisabled: boolean = false;
  @Input() isTableFiltered: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  get enabled(): boolean {
    return Boolean(
      this.hideColumns.observed ||
        this.clearFilters.observed ||
        this.clearSort.observed ||
        this.clearMarkers.observed ||
        this.bulkDelete.observed
    );
  }
}
