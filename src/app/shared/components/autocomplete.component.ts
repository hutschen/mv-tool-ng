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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'mvtool-autocomplete',
  template: `
    <div class="fx-column">
      <mat-form-field appearance="fill">
        <mat-label *ngIf="label">{{ label }}</mat-label>
        <input
          type="text"
          matInput
          [(ngModel)]="filterStr"
          [matAutocomplete]="autocomplete"
        />
        <mat-autocomplete #autocomplete="matAutocomplete">
          <mat-option *ngFor="let option of filteredOptions" [value]="option">
            {{ option }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class AutocompleteComponent {
  filteredOptions: string[] = [];
  @Input() label: string = '';
  @Input() options: string[] = [];
  @Input() value?: string | null;
  @Output() valueChange = new EventEmitter<string | null>();

  constructor() {}

  get filterStr(): string {
    return this.value ?? '';
  }

  set filterStr(value: string) {
    this.value = value;
    this.valueChange.emit(value);
    this.filteredOptions = this.options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }
}
