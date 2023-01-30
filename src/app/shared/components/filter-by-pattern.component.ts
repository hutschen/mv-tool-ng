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

import { Component, Input } from '@angular/core';
import { FilterByPattern } from '../filter';

@Component({
  selector: 'mvtool-filter-by-pattern',
  template: `
    <div class="fx-column">
      <p>
        Enter a filter pattern. The wildcards
        <code matTooltip="matches zero or more characters">*</code> and
        <code matTooltip="matches exactly one character">?</code> can be used.
        Unlike a search, the data is filtered for exact matches.
      </p>
      <mat-form-field appearance="fill">
        <mat-label>Pattern</mat-label>
        <input name="pattern" matInput [(ngModel)]="filter.pattern" />
        <button
          *ngIf="filter.pattern"
          matSuffix
          mat-icon-button
          aria-label="Clear"
          (click)="filter.clear()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FilterByPatternComponent {
  @Input() filter!: FilterByPattern;

  constructor() {}
}
