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

interface IConfirmDialogData {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  constructor(protected _dialog: MatDialog) {}

  openConfirmDialog(
    title: string,
    message: string
  ): MatDialogRef<ConfirmDialogComponent, boolean> {
    return this._dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title,
        message,
      } as IConfirmDialogData,
    });
  }
}

@Component({
  selector: 'mvtool-confirm-dialog',
  template: `
    <div mat-dialog-title>{{ title }}</div>
    <div mat-dialog-content>{{ message }}</div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
        No
      </button>
      <button mat-raised-button color="accent" (click)="onConfirm()">
        <mat-icon>check</mat-icon>
        Yes
      </button>
    </div>
  `,
  styles: [],
})
export class ConfirmDialogComponent {
  title: string;
  message: string;

  constructor(
    protected _dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: IConfirmDialogData
  ) {
    this.title = dialogData.title;
    this.message = dialogData.message;
  }

  onConfirm() {
    this._dialogRef.close(true);
  }

  onCancel() {
    this._dialogRef.close(false);
  }
}
