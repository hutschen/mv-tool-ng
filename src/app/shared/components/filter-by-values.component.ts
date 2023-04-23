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
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { debounceTime, startWith, switchMap, tap } from 'rxjs/operators';
import { FilterByValues, IFilterOption } from '../data/filter';

@Component({
  selector: 'mvtool-filter-by-values',
  template: `
    <div class="fx-column">
      <p>
        Define a list of specific values. Entries containing these values will
        be filtered out.
        <span *ngIf="filter.options.hasToLoad">
          The wildcards
          <code matTooltip="matches zero or more characters">*</code> and
          <code matTooltip="matches exactly one character">?</code> can be used
          to search for values.
        </span>
      </p>
      <mat-form-field appearance="fill">
        <mat-label>Selected values</mat-label>
        <mat-chip-grid #chipGrid aria-label="Value selection">
          <mat-chip-row
            *ngFor="let option of filter.options.selection$ | async"
            (removed)="filter.options.deselectOptions(option)"
          >
            {{ option.label }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
          <input
            placeholder="Search value ..."
            #valueInput
            [formControl]="valueCtrl"
            [matAutocomplete]="auto"
            [matChipInputFor]="chipGrid"
            [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
            (matChipInputTokenEnd)="onTokenEnd($event)"
          />
        </mat-chip-grid>
        <mat-autocomplete
          #auto="matAutocomplete"
          autoActiveFirstOption
          (optionSelected)="onSelectOption($event)"
        >
          <mat-option *ngFor="let option of options$ | async" [value]="option">
            {{ option.label }}
          </mat-option>
        </mat-autocomplete>
        <mat-spinner
          *ngIf="isLoadingOptions"
          matSuffix
          diameter="20"
        ></mat-spinner>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FilterByValuesComponent implements OnInit {
  @Input() filter!: FilterByValues;
  separatorKeysCodes: number[] = [ENTER];
  valueCtrl = new FormControl('');
  isLoadingOptions = false;
  options$!: Observable<IFilterOption[]>;

  @ViewChild('valueInput') valueInput!: ElementRef<HTMLInputElement>;

  constructor() {}

  ngOnInit(): void {
    this.options$ = this.valueCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(this.filter.options.hasToLoad ? 250 : 0),
      tap(
        () => (this.isLoadingOptions = true && this.filter.options.hasToLoad)
      ),
      switchMap((value) => this.filter.options.filterOptions(value, 10)),
      tap(() => (this.isLoadingOptions = false))
    );
  }

  onTokenEnd(event: MatChipInputEvent): void {
    // Clear the input value to keep the input field clean
    event.chipInput!.clear();
    this.valueCtrl.setValue(null);
  }

  onSelectOption(event: MatAutocompleteSelectedEvent) {
    this.filter.options.selectOptions(event.option.value);
    this.valueInput.nativeElement.value = '';
    this.valueCtrl.setValue(null);
  }
}
