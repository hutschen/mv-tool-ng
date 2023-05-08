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

import { Component, Input, OnInit } from '@angular/core';
import { IOption, Options } from '../data/options';
import { Observable, defer, finalize } from 'rxjs';

@Component({
  selector: 'mvtool-selection-list',
  template: `
    <mat-selection-list [multiple]="options.isMultipleSelection">
      <mat-list-option
        *ngFor="let option of loadedOptions$ | async"
        [value]="option.value"
      >
        {{ option.label }}
      </mat-list-option>
    </mat-selection-list>
  `,
  styles: [],
})
export class SelectionListComponent implements OnInit {
  @Input() options!: Options;
  loadedOptions$!: Observable<IOption[]>;
  isLoadingOptions = false;

  constructor() {}

  ngOnInit(): void {
    // Initially load all options
    this.loadedOptions$ = defer(() => {
      this.isLoadingOptions = true && this.options.hasToLoad;
      return this.options.filterOptions();
    }).pipe(finalize(() => (this.isLoadingOptions = false)));
  }
}
