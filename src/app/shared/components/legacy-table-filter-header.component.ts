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

import { Component, Input } from '@angular/core';
import { TableColumn } from '../table-columns';
import { LegacyTableComponent } from './legacy-table.component';

@Component({
  selector: 'mvtool-legacy-table-filter-header',
  template: `
    <span
      (click)="table.onSetFilter(column); $event.stopPropagation()"
      matTooltip="Click to filter"
    >
      {{ column.label }}
      <mat-icon class="filter-icon" *ngIf="column.filtered"
        >filter_alt
      </mat-icon>
    </span>
  `,
  styles: ['.filter-icon {   width: 12px; height: 12px; font-size: 12px;}'],
})
export class LegacyTableFilterHeaderComponent<T extends object> {
  @Input() column!: TableColumn<T>;
  @Input() table!: LegacyTableComponent<T>;

  constructor() {}
}
