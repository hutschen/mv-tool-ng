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
  areSelectedValuesChanged,
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
  filter,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
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
          *ngIf="isLoadingOptions"
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
  protected _writtenValueSubject = new Subject<OptionValue[]>();
  protected _isWritingValue = false; // TODO: This is used for temporary workaround to prevent emitting values set by writeValue()

  separatorKeysCodes: number[] = [ENTER];
  filterCtrl = new FormControl('');
  loadedOptions$!: Observable<IOption[]>;
  isLoadingOptions = false;
  isfilterInputHidden = false;
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  // Need to implement ControlValueAccessor
  onChange: (_: any) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  constructor() {}

  ngOnInit(): void {
    // Load options when the filter changes
    this.loadedOptions$ = this.filterCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(this.options.hasToLoad ? 250 : 0),
      tap(() => (this.isLoadingOptions = true && this.options.hasToLoad)),
      switchMap((filter) => this.options.filterOptions(filter, 10)),
      tap(() => (this.isLoadingOptions = false))
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

    // Set the incoming value
    this._writtenValueSubject
      .pipe(
        debounceTime(this.options.hasToLoad ? 250 : 0),
        withLatestFrom(this.options.selection$),
        // Check if selection will be changed by the new value
        filter(([values, options]) =>
          areSelectedValuesChanged(
            values,
            options.map((o) => o.value)
          )
        ),
        // Load the options corresponding to the new value,
        // but stop if the selection changes in the meantime
        switchMap(([values]) =>
          this.options
            .getOptions(...values)
            .pipe(takeUntil(this.options.selectionChanged$))
        )
      )
      .subscribe((options) => {
        this._isWritingValue = true; // writing value flag has to be set before changing the selection
        if (!this.options.setSelection(...options)) {
          this._isWritingValue = false; // if selection is not changed, writing value flag has to be reset
        }
      });

    // Emit the changed values when the selection changes
    this.options.selectionChanged$
      .pipe(map((options) => options.map((o) => o.value)))
      .subscribe((values) => {
        if (!this._isWritingValue) {
          this.onChange(
            fromOptionValues(values, this.options.isMultipleSelection)
          );
          this.onTouched();
        } else {
          this._isWritingValue = false;
        }
      });
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
