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

interface IFilterDialogData<T extends object> {
  column: TableColumn<T>;
  data: T[];
}

@Injectable({
  providedIn: 'root',
})
export class FilterDialogService<T extends object> {
  constructor(protected _dialog: MatDialog) {}

  openFilterDialog(
    column: TableColumn<T>,
    data: T[]
  ): MatDialogRef<FilterDialogComponent<T>, string[]> {
    return this._dialog.open(FilterDialogComponent, {
      width: '500px',
      data: { column, data } as IFilterDialogData<T>,
    });
  }
}

class FilterOption {
  text: string;
  selected: boolean;

  constructor(text: string, selected?: boolean) {
    this.text = text;
    this.selected = selected ?? true;
  }

  toggleSelected() {
    this.selected = !this.selected;
  }
}

class FilterSelection {
  filterOptions: FilterOption[];

  constructor(
    searchStr: string,
    filters: string[],
    selectedFilters: string[] = []
  ) {
    searchStr = searchStr.toLowerCase();
    filters = filters
      .filter((filter, index) => filters.indexOf(filter) === index) // remove duplicates
      .filter((filter) => filter.toLowerCase().includes(searchStr));
    selectedFilters = selectedFilters.map((filter) => filter.toLowerCase());
    selectedFilters = selectedFilters.filter(
      (filter, index) => selectedFilters.indexOf(filter) === index
    );

    if (selectedFilters.length) {
      this.filterOptions = filters.map(
        (filter) =>
          new FilterOption(
            filter,
            selectedFilters.includes(filter.toLowerCase())
          )
      );
    } else {
      this.filterOptions = filters.map((filter) => new FilterOption(filter));
    }
  }

  get isEmpty(): boolean {
    return this.filterOptions.length === 0;
  }

  get allSelected(): boolean {
    return this.filterOptions.every((filter) => filter.selected);
  }

  get nothingSelected(): boolean {
    return this.filterOptions.every((filter) => !filter.selected);
  }

  get partlySelected(): boolean {
    return !this.allSelected && !this.nothingSelected;
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.filterOptions.forEach((filter) => (filter.selected = false));
    } else {
      this.filterOptions.forEach((filter) => (filter.selected = true));
    }
  }

  get selectedFilters(): string[] {
    return this.filterOptions
      .filter((filter) => filter.selected)
      .map((filter) => filter.text);
  }
}

@Component({
  selector: 'mvtool-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['../styles/flex.css', '../styles/truncate.css'],
  styles: [
    'ul { list-style-type: none; padding-left: 0;}',
    '.checkbox-label { width: 420px; }',
  ],
})
export class FilterDialogComponent<T extends object> {
  column: TableColumn<T>;
  protected _texts: string[];
  filterSelection: FilterSelection;
  protected _searchStr = '';

  constructor(
    protected _dialogRef: MatDialogRef<FilterDialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) dialogData: IFilterDialogData<T>
  ) {
    this.column = dialogData.column;
    this._texts = dialogData.data.map((data) => this.column.toStr(data));
    this.filterSelection = new FilterSelection(
      this._searchStr,
      this._texts,
      this.column.filters
    );
  }

  get searchStr(): string {
    return this._searchStr;
  }

  set searchStr(searchStr: string) {
    this._searchStr = searchStr;
    this.filterSelection = new FilterSelection(this._searchStr, this._texts);
  }

  onApplyFilter(): void {
    if (!this.searchStr && this.filterSelection.allSelected) {
      this._dialogRef.close([]);
    } else {
      this._dialogRef.close(this.filterSelection.selectedFilters);
    }
  }

  onRemoveFilter(): void {
    this._dialogRef.close([]);
  }
}
