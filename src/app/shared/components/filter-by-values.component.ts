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

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { FilterByValues, IFilterOption } from '../filter';

@Component({
  selector: 'mvtool-filter-by-values',
  template: `
    <div class="fx-column">
      <mat-form-field appearance="fill">
        <mat-label>Search term</mat-label>
        <input
          type="text"
          matInput
          [(ngModel)]="searchStr"
          [matAutocomplete]="autocomplete"
        />
        <mat-autocomplete #autocomplete="matAutocomplete">
          <mat-option *ngFor="let option of options" [value]="option">
            {{ option.label }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FilterByValuesComponent implements AfterViewInit {
  @Input() filter!: FilterByValues;
  @ViewChild(MatInput) input!: MatInput;
  @ViewChild(MatAutocomplete) autocomplete!: MatAutocomplete;

  options: IFilterOption[] = [];
  protected _searchSubject = new BehaviorSubject<string>('');

  constructor() {
    this._searchSubject.pipe(debounceTime(250)).subscribe((searchStr) => {
      this.filter.getOptions(searchStr, 10).subscribe((options) => {
        this.options = options;
      });
    });
  }

  ngAfterViewInit(): void {
    this.autocomplete.optionActivated.subscribe((event) => {
      console.log('selected option', event.option?.value);
      // deselect option
      this.input.value = '';
      event.option?.deselect();
    });
  }

  get searchStr(): string {
    return this._searchSubject.value;
  }

  set searchStr(searchStr: string) {
    this._searchSubject.next(searchStr);
  }
}
