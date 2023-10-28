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

import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  IOption,
  OptionValue,
  Options,
  fromOptionValues,
  toOptionValues,
} from '../data/options';
import {
  Subject,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  merge,
  share,
  skip,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'mvtool-selection-list',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectionListComponent),
      multi: true,
    },
  ],
  template: `
    <!-- Loading indicator -->
    <div class="loading fx-row" *ngIf="_isLoadingOptions">
      <div class="fx-grow">Loading ...</div>
      <div><mat-spinner [diameter]="20"></mat-spinner></div>
    </div>

    <!-- Selection list -->
    <mat-selection-list
      *ngIf="!_isLoadingOptions"
      [multiple]="options.isMultipleSelection"
    >
      <mat-list-option
        *ngIf="options.isMultipleSelection"
        (click)="invertSelection ? toggleSelectNothing() : toggleSelectAll()"
        [selected]="invertSelection ? isNothingSelected : isAllSelected"
        [disabled]="_isDisabled"
      >
        Select all
      </mat-list-option>
      <mat-list-option
        *ngFor="let option of _loadedOptions"
        [value]="option.value"
        [selected]="options.isSelected(option) !== invertSelection"
        (click)="options.toggleOption(option)"
        [disabled]="_isDisabled"
      >
        {{ option.label }}
      </mat-list-option>
    </mat-selection-list>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [
    '.loading { line-height: 24px; padding-left: 16px; padding-right: 16px;}',
  ],
})
export class SelectionListComponent implements OnInit, ControlValueAccessor {
  @Input() options!: Options;
  @Input() invertSelection = false;
  protected _writtenValueSubject = new Subject<OptionValue[]>();

  protected _loadedOptions!: IOption[];
  protected _isLoadingOptions = false;

  // For ControlValueAccessor
  protected _onChange: (value: any) => void = () => {};
  protected _onTouched: () => void = () => {};
  protected _isDisabled = false;

  constructor() {}

  ngOnInit() {
    // invertSelection flag can only be set on multiple selections
    if (this.invertSelection && !this.options.isMultipleSelection) {
      throw new Error('invertSelection can only be set on multiple selections');
    }

    // Initially load all options
    this._isLoadingOptions = true && this.options.hasToLoad;
    this.options
      .getAllOptions()
      .pipe(finalize(() => (this._isLoadingOptions = false)))
      .subscribe((options) => (this._loadedOptions = options));

    // Manages the current value. This is necessary because a value written via
    // writeValue will only actually be reflected in this.options.selection$
    // after some time, since options corresponding to the value have to be
    // loaded.
    const valueChanges$ = merge(
      this.options.selection$.pipe(
        map((options) => options.map((o) => o.value)),
        map((values) => [values, false] as [OptionValue[], boolean])
      ),
      this._writtenValueSubject.pipe(
        map((values) => [values, true] as [OptionValue[], boolean])
      )
    ).pipe(
      // Only emit if the value is changed
      distinctUntilChanged(
        ([prev], [curr]) =>
          prev.length === curr.length &&
          prev.every(Set.prototype.has, new Set(curr))
      ),
      // Skip the first value, since it is the initial value
      skip(1),
      share()
    );

    // Set incoming values which are set using the writeValue method
    valueChanges$
      .pipe(
        filter(([, isWritten]) => isWritten),
        map(([values]) => values),
        // Load the options corresponding to the new value,
        // but stop if the selection changes in the meantime
        switchMap((values) => {
          this._isLoadingOptions = true && this.options.hasToLoad;
          return this.options.getOptions(...values).pipe(
            takeUntil(this.options.selectionChanged$),
            finalize(() => (this._isLoadingOptions = false))
          );
        })
      )
      .subscribe((options) => {
        this.options.setSelection(...options);
      });

    // Call onChange when the value is changed by the control itself
    valueChanges$
      .pipe(
        filter(([, isWritten]) => !isWritten),
        map(([values]) => values)
      )
      .subscribe((values) => {
        this._onChange(
          fromOptionValues(values, this.options.isMultipleSelection)
        );
        this._onTouched();
      });
  }

  writeValue(value: any): void {
    this._writtenValueSubject.next(toOptionValues(value));
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
  }

  get isNothingSelected(): boolean {
    return 0 === this.options.selection.length;
  }

  get isAllSelected(): boolean {
    return this._loadedOptions.length === this.options.selection.length;
  }

  toggleSelectNothing(): void | boolean {
    if (!this.options.isMultipleSelection) {
      return false;
    }
    if (this.isNothingSelected) {
      this.options.setSelection(...this._loadedOptions);
    } else {
      this.options.clearSelection();
    }
  }

  toggleSelectAll(): void | boolean {
    if (!this.options.isMultipleSelection) {
      return false;
    }
    if (this.isAllSelected) {
      this.options.clearSelection();
    } else {
      this.options.setSelection(...this._loadedOptions);
    }
  }
}
