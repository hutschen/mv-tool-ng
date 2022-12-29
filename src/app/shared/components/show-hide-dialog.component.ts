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

import { Component, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TableColumn } from '../table-columns';

@Injectable({
  providedIn: 'root',
})
export class ShowHideDialogService {
  constructor(protected _dialog: MatDialog) {}

  openShowHideDialog(
    columns: TableColumn<any>[]
  ): MatDialogRef<ShowHideDialogComponent, string[]> {
    return this._dialog.open(ShowHideDialogComponent, {
      width: '500px',
      data: columns,
    });
  }
}

@Component({
  selector: 'mvtool-show-hide-dialog',
  template: ` <p>show-hide-dialog works!</p> `,
  styles: [],
})
export class ShowHideDialogComponent {
  constructor() {}
}
