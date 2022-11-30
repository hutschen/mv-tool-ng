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

import { Component, Injectable, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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
  selector: 'mvtool-confim-dialog',
  template: ` <p>confim-dialog works!</p> `,
  styles: [],
})
export class ConfirmDialogComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
