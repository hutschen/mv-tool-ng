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
import { Filterable } from '../filter';
import { FilterDialogService } from './filter-dialog.component';

@Component({
  selector: 'mvtool-filter-header',
  template: `
    <span (click)="onFilter($event)" matTooltip="Click to filter">
      <ng-content></ng-content>
      <mat-icon class="filter-icon" *ngIf="filterable.filtered">
        filter_alt
      </mat-icon>
    </span>
  `,
  styles: ['.filter-icon {   width: 12px; height: 12px; font-size: 12px;}'],
})
export class FilterHeaderComponent {
  @Input() filterable!: Filterable;

  constructor(protected _filterDialogService: FilterDialogService) {}

  onFilter($event: Event) {
    $event.stopPropagation();
    this._filterDialogService.openFilterDialog(this.filterable);
  }
}
