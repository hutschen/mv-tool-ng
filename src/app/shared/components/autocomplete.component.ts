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

import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { IOption, Options } from '../data/options';
import {
  Observable,
  Subject,
  debounceTime,
  merge,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'mvtool-autocomplete',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
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
          (blur)="onTouched()"
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
export class AutocompleteComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() options!: Options;

  filterCtrl = new FormControl('');
  loadedOptions$!: Observable<IOption[]>;
  isLoadingOptions = false;

  protected _writtenValueSubject = new Subject<string | null>();
  onChange: (_: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {}

  ngOnInit(): void {
    // Load options when the filter changes
    this.loadedOptions$ = merge(
      this.filterCtrl.valueChanges,
      this._writtenValueSubject
    ).pipe(
      startWith(this.filterCtrl.value),
      debounceTime(this.options.hasToLoad ? 250 : 0),
      tap(() => (this.isLoadingOptions = true && this.options.hasToLoad)),
      switchMap((filter) => this.options.filterOptions(filter, 10)),
      tap(() => (this.isLoadingOptions = false))
    );

    // Emit value when the filter changes
    this.filterCtrl.valueChanges.subscribe((value) => {
      this.onChange(value);
      this.onTouched();
    });
  }

  writeValue(value: any): void {
    value = typeof value === 'string' ? value : null;
    this.filterCtrl.setValue(value, { emitEvent: false });
    this._writtenValueSubject.next(value);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.filterCtrl.disable({ emitEvent: false });
    else this.filterCtrl.enable({ emitEvent: false });
  }
}
