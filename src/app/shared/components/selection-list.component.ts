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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  IOption,
  OptionValue,
  Options,
  areSelectedValuesChanged,
  fromOptionValues,
  toOptionValues,
} from '../data/options';
import {
  Observable,
  ReplaySubject,
  defer,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs';

@Component({
  selector: 'mvtool-selection-list',
  template: `
    <!-- Loading indicator -->
    <div class="loading fx-row" *ngIf="isLoadingOptions">
      <div class="fx-grow">Loading ...</div>
      <div><mat-spinner [diameter]="20"></mat-spinner></div>
    </div>

    <!-- Selection list -->
    <mat-selection-list [multiple]="options.isMultipleSelection">
      <mat-list-option
        *ngFor="let option of loadedOptions$ | async"
        [value]="option.value"
        [selected]="options.isSelected(option)"
        (click)="options.toggleOption(option)"
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
export class SelectionListComponent implements OnInit {
  @Input() options!: Options;
  @Output() valueChange = new EventEmitter<any>();
  protected _valueSubject = new ReplaySubject<OptionValue[]>(1);

  loadedOptions$!: Observable<IOption[]>;
  isLoadingOptions = false;

  constructor() {}

  ngOnInit(): void {
    // Initially load all options
    this.loadedOptions$ = defer(() => {
      this.isLoadingOptions = true && this.options.hasToLoad;
      return this.options.filterOptions();
    }).pipe(finalize(() => (this.isLoadingOptions = false)));

    // Set the incoming value
    this._valueSubject
      .pipe(
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
        this.options.setSelection(...options);
      });

    // Emit the valueChange event when the selection changes
    this.options.selectionChanged$
      .pipe(map((options) => options.map((o) => o.value)))
      .subscribe((values) => {
        this.valueChange.emit(
          fromOptionValues(values, this.options.isMultipleSelection)
        );
      });
  }

  @Input()
  set value(value: unknown) {
    this._valueSubject.next(toOptionValues(value));
  }
}
