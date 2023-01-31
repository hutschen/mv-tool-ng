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

import { ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { FilterByValues, IFilterOption } from '../filter';

@Component({
  selector: 'mvtool-filter-by-values',
  template: `
    <div class="fx-column">
      <p>
        Define a list of specific values. Entries containing these values will
        be filtered out. The wildcards
        <code matTooltip="matches zero or more characters">*</code> and
        <code matTooltip="matches exactly one character">?</code> can be used to
        search for values.
      </p>
      <mat-form-field class="example-chip-list" appearance="fill">
        <mat-label>Selected values</mat-label>
        <mat-chip-list #chipList aria-label="Value selection">
          <mat-chip
            *ngFor="let option of filter.selectedOptions"
            (removed)="filter.deselectOption(option)"
          >
            {{ option.label }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
          <input
            placeholder="Search value ..."
            #valueInput
            [formControl]="valueCtrl"
            [matAutocomplete]="auto"
            [matChipInputFor]="chipList"
            [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
            (matChipInputTokenEnd)="onTokenEnd($event)"
          />
        </mat-chip-list>
        <mat-autocomplete
          #auto="matAutocomplete"
          autoActiveFirstOption
          (optionSelected)="onSelectOption($event)"
        >
          <mat-option *ngFor="let option of options$ | async" [value]="option">
            {{ option.label }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FilterByValuesComponent {
  @Input() filter!: FilterByValues;
  separatorKeysCodes: number[] = [ENTER];
  valueCtrl = new FormControl('');
  options$: Observable<IFilterOption[]>;

  @ViewChild('valueInput') valueInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.options$ = this.valueCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(250),
      switchMap((value) => this.filter.getOptions(value, 10))
    );
  }

  onTokenEnd(event: MatChipInputEvent): void {
    // Clear the input value to keep the input field clean
    event.chipInput!.clear();
    this.valueCtrl.setValue(null);
  }

  onSelectOption(event: MatAutocompleteSelectedEvent) {
    this.filter.selectOption(event.option.value);
    this.valueInput.nativeElement.value = '';
    this.valueCtrl.setValue(null);
  }
}
