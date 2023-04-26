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
import { FilterByValues } from '../data/filter';

@Component({
  selector: 'mvtool-filter-by-values',
  template: `
    <div class="fx-column">
      <p>
        Define a list of specific values. Entries containing these values will
        be filtered out.
        <span *ngIf="filter.options.hasToLoad">
          The wildcards
          <code matTooltip="matches zero or more characters">*</code> and
          <code matTooltip="matches exactly one character">?</code> can be used
          to search for values.
        </span>
      </p>
      <mvtool-options-input
        [options]="filter.options"
        label="Selected values"
        placeholder="Search value ..."
      ></mvtool-options-input>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class FilterByValuesComponent {
  @Input() filter!: FilterByValues;

  constructor() {}
}
