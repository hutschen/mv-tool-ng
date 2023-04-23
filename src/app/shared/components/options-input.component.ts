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
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IOption, Options } from '../data/options';
import { FormControl } from '@angular/forms';
import { ENTER } from '@angular/cdk/keycodes';
import { Observable, debounceTime, startWith, switchMap, tap } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'mvtool-options-input',
  template: `
    <div class="fx-column">
      <mat-form-field appearance="fill">
        <mat-label>{{ label }}</mat-label>
        <mat-chip-grid #chipGrid aria-label="Value selection">
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
export class OptionsInputComponent implements OnInit {
  @Input() label = 'Options';
  @Input() placeholder = 'Select options ...';
  @Input() options!: Options;
  @Output() valueChange = new EventEmitter<any | any[]>();

  separatorKeysCodes: number[] = [ENTER];
  filterCtrl = new FormControl('');
  loadedOptions$!: Observable<IOption[]>;
  isLoadingOptions = false;
  isfilterInputHidden = false;
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  constructor() {}

  ngOnInit(): void {
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
