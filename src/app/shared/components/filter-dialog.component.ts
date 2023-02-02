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

import { Component, Inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Filters } from '../filter';

@Injectable({
  providedIn: 'root',
})
export class FilterDialogService {
  constructor(protected _dialog: MatDialog) {}

  openFilterDialog(filterable: Filters): MatDialogRef<FilterDialogComponent> {
    return this._dialog.open(FilterDialogComponent, {
      width: '500px',
      data: filterable,
    });
  }
}

@Component({
  selector: 'mvtool-filter-dialog',
  template: `
    <div mat-dialog-title>Filter {{ filterable.label }}</div>
    <div mat-dialog-content>
      <!-- Filter by pattern -->
      <mvtool-filter-by-pattern
        *ngIf="filterable.filterByPattern"
        [filter]="filterable.filterByPattern"
      ></mvtool-filter-by-pattern>

      <!-- Filter by values -->
      <mvtool-filter-by-values
        *ngIf="filterable.filterByValues"
        [filter]="filterable.filterByValues"
      ></mvtool-filter-by-values>

      <!-- Filter for existence -->
      <mvtool-filter-for-existence
        *ngIf="filterable.filterForExistence"
        [filter]="filterable.filterForExistence"
      ></mvtool-filter-for-existence>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onClearFilter()">
        <mat-icon>filter_alt_off</mat-icon>
        Clear Filter
      </button>
      <button mat-raised-button color="accent" (click)="onClose()">OK</button>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['.mat-divider { margin-bottom: 10px; }'],
})
export class FilterDialogComponent {
  constructor(
    protected _dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public filterable: Filters
  ) {}

  onClearFilter() {
    this.filterable.clear();
    this._dialogRef.close();
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
