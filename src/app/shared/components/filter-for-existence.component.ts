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
import { FilterForExistence } from '../data/filter';

@Component({
  selector: 'mvtool-filter-for-existence',
  template: `
    <div class="fx-column">
      <p>Filter for the existence and non-existence of values.</p>
      <mat-form-field appearance="fill">
        <mat-label>Select filter criterion</mat-label>
        <mat-select name="existence" [(ngModel)]="filter.exists">
          <mat-option [value]="null">None</mat-option>
          <mat-option [value]="true">Non-Empty</mat-option>
          <mat-option [value]="false">Empty</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FilterForExistenceComponent {
  @Input() filter!: FilterForExistence;

  constructor() {}
}
