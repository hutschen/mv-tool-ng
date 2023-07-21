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

import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  forwardRef,
} from '@angular/core';
import {
  IOption,
  OptionValue,
  Options,
  fromOptionValues,
  toOptionValues,
} from '../data/options';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ENTER } from '@angular/cdk/keycodes';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  merge,
  share,
  skip,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'mvtool-options-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="fx-column">
      <mat-form-field appearance="fill">
        <mat-label>{{ label }}</mat-label>
        <mat-chip-grid
          #chipGrid
          aria-label="Value selection"
          [disabled]="isDisabled"
        >
          <mat-chip-row
            *ngFor="let option of options.selection$ | async"
            (removed)="options.deselectOptions(option)"
          >
            <span class="chip-content">
              <span class="truncate">{{ option.label }}</span>
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </span>
          </mat-chip-row>
          <input
            #filterInput
            [class.hidden]="isfilterInputHidden"
            [readOnly]="isfilterInputHidden"
            [placeholder]="placeholder"
            [formControl]="filterCtrl"
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
          <mat-option
            *ngFor="let option of loadedOptions$ | async"
            [value]="option"
          >
            {{ option.label }}
          </mat-option>
        </mat-autocomplete>
        <mat-spinner
          class="spinner"
          *ngIf="isLoading"
          matSuffix
          diameter="20"
        ></mat-spinner>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss', '../styles/truncate.scss'],
  styles: [
    '.chip-content { display: flex; max-width: 380px; }',
    '.spinner { margin-right: 10px; }',
    '.hidden { width: 0 !important; height: 0 !important; }',
  ],
})
export class OptionsInputComponent implements OnInit, ControlValueAccessor {
  @Input() label = 'Options';
  @Input() placeholder = 'Select options ...';
  @Input() options!: Options;

  separatorKeysCodes: number[] = [ENTER];
  filterCtrl = new FormControl('');
  loadedOptions$!: Observable<IOption[]>;
  protected _isLoadingOptions = false;
  protected _isLoadingSelection = false;
  isfilterInputHidden = false;
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  // Need to implement ControlValueAccessor
  protected _writtenValueSubject = new Subject<OptionValue[]>();
  onChange: (_: any) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  ngOnInit(): void {
    // Load options when the filter changes
    this.loadedOptions$ = this.filterCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(this.options.hasToLoad ? 250 : 0),
      switchMap((filter) => {
        this._isLoadingOptions = true && this.options.hasToLoad;
        return this.options
          .filterOptions(filter, 10)
          .pipe(finalize(() => (this._isLoadingOptions = false)));
      })
    );

    // Dynamically show/hide the filter input if only one option can be selected
    if (!this.options.isMultipleSelection) {
      this.options.selection$.subscribe((options) => {
        if (0 < options.length) {
          this.isfilterInputHidden = true;
        } else {
          this.isfilterInputHidden = false;
        }
      });
    }

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
          this._isLoadingSelection = true && this.options.hasToLoad;
          return this.options.getOptions(...values).pipe(
            takeUntil(this.options.selectionChanged$),
            finalize(() => (this._isLoadingSelection = false))
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
        this.onChange(
          fromOptionValues(values, this.options.isMultipleSelection)
        );
        this.onTouched();
      });
  }

  get isLoading(): boolean {
    return this._isLoadingOptions || this._isLoadingSelection;
  }

  writeValue(value: any): void {
    this._writtenValueSubject.next(toOptionValues(value));
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) this.filterCtrl.disable();
    else this.filterCtrl.enable();
  }

  onTokenEnd(event: MatChipInputEvent): void {
    // Clear the input value to keep the input field clean
    event.chipInput!.clear();
    this.filterCtrl.setValue(null);
  }

  onSelectOption(event: MatAutocompleteSelectedEvent) {
    this.options.selectOptions(event.option.value);
    this.filterInput.nativeElement.value = '';
    this.filterCtrl.setValue(null);
  }
}
