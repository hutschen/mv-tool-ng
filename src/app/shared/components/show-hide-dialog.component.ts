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

import { Component, Inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { TableColumn } from '../table-columns';

interface IShowHideDialogData {
  columns: TableColumn<any>[];
  allowHideAll: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ShowHideDialogService {
  constructor(protected _dialog: MatDialog) {}

  openShowHideDialog(
    columns: TableColumn<any>[],
    allowHideAll: boolean = false
  ): MatDialogRef<ShowHideDialogComponent, string[]> {
    return this._dialog.open(ShowHideDialogComponent, {
      width: '500px',
      data: { columns, allowHideAll } as IShowHideDialogData,
    });
  }
}

class ColumnOption {
  selected: boolean;

  constructor(public column: TableColumn<any>) {
    this.selected = !column.hidden;
  }

  toggleSelected() {
    this.selected = !this.selected;
  }
}

class ColumnSelection {
  options: ColumnOption[];

  constructor(columns: TableColumn<any>[]) {
    this.options = columns.map((c) => new ColumnOption(c));
  }

  get allSelected(): boolean {
    return this.options.every((o) => o.selected);
  }

  get nothingSelected(): boolean {
    return this.options.every((o) => !o.selected);
  }

  get partlySelected(): boolean {
    return !this.allSelected && !this.nothingSelected;
  }

  toggleAllSelected() {
    const selected = !this.allSelected;
    this.options.forEach((o) => (o.selected = selected));
  }

  get unselectedColumns(): TableColumn<any>[] {
    return this.options.filter((o) => !o.selected).map((o) => o.column);
  }
}

@Component({
  selector: 'mvtool-show-hide-dialog',
  template: `
    <div mat-dialog-title>Show/Hide Columns</div>
    <div mat-dialog-content>
      <ul>
        <li>
          <mat-checkbox
            [checked]="selection.allSelected"
            [indeterminate]="selection.partlySelected"
            (change)="selection.toggleAllSelected()"
          >
            Show all columns
          </mat-checkbox>
        </li>
        <li *ngFor="let option of selection.options">
          <mat-checkbox
            [checked]="option.selected"
            (change)="option.toggleSelected()"
          >
            Show {{ option.column.label }}</mat-checkbox
          >
        </li>
      </ul>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
        Cancel
      </button>
      <button
        mat-raised-button
        color="accent"
        [disabled]="selection.nothingSelected && !allowHideAll"
        (click)="onSave()"
      >
        <mat-icon>save</mat-icon>
        Save
      </button>
    </div>
  `,
  styles: ['ul { list-style-type: none; padding-left: 0;}'],
})
export class ShowHideDialogComponent {
  selection: ColumnSelection;
  allowHideAll: boolean;

  constructor(
    protected _dialogRef: MatDialogRef<ShowHideDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IShowHideDialogData
  ) {
    this.selection = new ColumnSelection(dialogData.columns);
    this.allowHideAll = dialogData.allowHideAll;
  }

  onSave() {
    this._dialogRef.close(this.selection.unselectedColumns.map((c) => c.id));
  }

  onCancel() {
    this._dialogRef.close();
  }
}
