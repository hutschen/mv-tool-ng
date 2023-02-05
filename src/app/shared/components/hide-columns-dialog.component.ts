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
import { DataColumns, IDataItem } from '../data';

@Injectable({
  providedIn: 'root',
})
export class HideColumnsDialogService {
  constructor(protected _dialog: MatDialog) {}

  openHideColumnsDialog(
    columns: DataColumns<IDataItem>
  ): MatDialogRef<HideColumnsDialogComponent> {
    return this._dialog.open(HideColumnsDialogComponent, {
      width: '500px',
      data: columns,
    });
  }
}

@Component({
  selector: 'mvtool-hide-columns-dialog',
  template: `
    <div mat-dialog-title>Hide Columns</div>
    <div mat-dialog-content>
      <p>The columns in the list below can be hidden by selecting them.</p>
      <mat-selection-list>
        <mat-list-option
          *ngFor="let column of columns.hideableColumns"
          [(selected)]="column.hidden"
        >
          {{ column.label }}
        </mat-list-option>
      </mat-selection-list>
    </div>
    <div mat-dialog-actions align="end">
      <button
        mat-button
        [disabled]="!(columns.areColumnsHidden$ | async)"
        (click)="columns.unhideAllColumns()"
      >
        <mat-icon>visibility</mat-icon>
        Show all
      </button>
      <button mat-raised-button color="accent" (click)="onClose()">
        <mat-icon *ngIf="columns.areColumnsHidden$ | async"
          >visibility_off</mat-icon
        >
        <mat-icon *ngIf="!(columns.areColumnsHidden$ | async)"
          >visibility</mat-icon
        >
        Close
      </button>
    </div>
  `,
  styles: [],
})
export class HideColumnsDialogComponent {
  constructor(
    protected _dialogRef: MatDialogRef<HideColumnsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public columns: DataColumns<IDataItem>
  ) {}

  onClose(): void {
    this._dialogRef.close();
  }
}
