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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IOption, Options } from '../data/options';
import { Observable, debounceTime, startWith, switchMap, tap } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'mvtool-autocomplete',
  template: `
    <div class="fx-column">
      <mat-form-field appearance="fill">
        <mat-label *ngIf="label">{{ label }}</mat-label>
        <input
          type="text"
          matInput
          [placeholder]="placeholder"
          [formControl]="filterCtrl"
          [matAutocomplete]="auto"
        />
        <mat-autocomplete #auto="matAutocomplete" autoActiveFirstOption>
          <mat-option
            *ngFor="let option of loadedOptions$ | async"
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-autocomplete>
        <mat-spinner
          class="spinner"
          *ngIf="isLoadingOptions"
          matSuffix
          diameter="20"
        ></mat-spinner>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: ['.spinner { margin-right: 10px; }'],
})
export class AutocompleteComponent implements OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() options!: Options;
  @Output() valueChange = new EventEmitter<string | null>();

  filterCtrl = new FormControl('');
  loadedOptions$!: Observable<IOption[]>;
  isLoadingOptions = false;

  constructor() {}

  ngOnInit(): void {
    // Load options when the filter changes
    this.loadedOptions$ = this.filterCtrl.valueChanges.pipe(
      startWith(this.filterCtrl.value),
      debounceTime(this.options.hasToLoad ? 250 : 0),
      tap(() => (this.isLoadingOptions = true && this.options.hasToLoad)),
      switchMap((filter) => this.options.filterOptions(filter, 10)),
      tap(() => (this.isLoadingOptions = false))
    );

    // Emit value when the filter changes
    this.filterCtrl.valueChanges.subscribe((value) =>
      this.valueChange.emit(value)
    );
  }

  @Input()
  set value(value: string | null | undefined) {
    this.filterCtrl.setValue(value ?? null);
  }
}
