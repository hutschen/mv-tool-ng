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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';

type FilterOperator<T> = (data$: Observable<T[]>) => Observable<T[]>;

interface IFilterDialogData<T> {
  filterName: string;
  columnName: string;
  data$: Observable<T[]>;
}

@Injectable({
  providedIn: 'root',
})
export class FilterDialogService<T> {
  constructor(protected _dialog: MatDialog) {}

  openFilterDialog(
    filterName: string,
    columnName: string,
    data$: Observable<T[]>
  ): MatDialogRef<FilterDialogComponent<T>, FilterOperator<T>> {
    return this._dialog.open(FilterDialogComponent, {
      width: '500px',
      data: { filterName, columnName, data$ } as IFilterDialogData<T>,
    });
  }
}

@Component({
  selector: 'mvtool-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styles: [],
})
export class FilterDialogComponent<T> implements OnInit {
  constructor(
    protected _dialogRef: MatDialogRef<FilterDialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) dialogData: IFilterDialogData<T>
  ) {}

  ngOnInit(): void {}

  onSave(form: NgForm): void {
    console.log('onSave', form);
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
