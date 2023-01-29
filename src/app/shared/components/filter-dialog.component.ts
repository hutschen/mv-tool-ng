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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Filterable } from '../filter';

@Injectable({
  providedIn: 'root',
})
export class FilterDialogService {
  constructor(protected _dialog: MatDialog) {}

  openFilterDialog(
    filterable: Filterable
  ): MatDialogRef<FilterDialogComponent> {
    return this._dialog.open(FilterDialogComponent, {
      width: '500px',
      data: filterable,
    });
  }
}

@Component({
  selector: 'mvtool-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styles: [],
})
export class FilterDialogComponent implements OnInit {
  constructor(
    protected _dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public filterable: Filterable
  ) {}

  ngOnInit(): void {
    // TODO: get filter options if a values filter is used
  }
}
