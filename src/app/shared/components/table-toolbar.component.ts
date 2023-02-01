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

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mvtool-table-toolbar',
  template: `
    <div class="fx-row fx-space-between-center">
      <div class="fx-row fx-start-center">
        <!-- Button to refresh table -->
        <button *ngIf="refresh.observed" mat-button (click)="refresh.emit()">
          <mat-icon>refresh</mat-icon>
          {{ refeshLabel }}
        </button>

        <!-- Button to create item -->
        <button *ngIf="create.observed" mat-button (click)="create.emit()">
          <mat-icon>add</mat-icon>
          {{ createLabel }}
        </button>

        <!-- Button to upload / import -->
        <button *ngIf="upload.observed" mat-button (click)="upload.emit()">
          <mat-icon>file_upload</mat-icon>
          {{ uploadLabel }}
        </button>

        <!-- Button to download / export -->
        <button *ngIf="download.observed" mat-button (click)="download.emit()">
          <mat-icon>file_download</mat-icon>
          {{ downloadLabel }}
        </button>

        <ng-content></ng-content>
      </div>

      <!-- Filter -->
      <div *ngIf="search.observed || showSearch" class="fx-column fx-flex-30">
        <mat-form-field appearance="fill">
          <mat-label>{{ searchLabel }}</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchStr" />
          <button
            *ngIf="searchStr"
            matSuffix
            mat-icon-button
            aria-label="Clear"
            (click)="searchStr = ''"
          >
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>
      </div>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class TableToolbarComponent {
  @Output() refresh = new EventEmitter();
  @Output() create = new EventEmitter();
  @Output() upload = new EventEmitter();
  @Output() download = new EventEmitter();
  @Output() search = new EventEmitter<string>();
  @Input() refeshLabel: string = 'Refresh Table';
  @Input() createLabel: string = 'Create';
  @Input() uploadLabel: string = 'Import Excel';
  @Input() downloadLabel: string = 'Export Excel';
  @Input() searchLabel: string = 'Filter';
  @Input() showSearch: boolean = false;
  protected _searchStr: string = '';

  constructor() {}

  get searchStr(): string {
    return this._searchStr;
  }

  set searchStr(value: string) {
    this._searchStr = value;
    this.search.emit(this._searchStr);
  }
}
