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

import { Component } from '@angular/core';

export interface IAutoNumber {
  kind: 'number';
  start: number;
  step: number;
  prefix: string;
  suffix: string;
}

@Component({
  selector: 'mvtool-auto-number-input',
  template: `
    <div class="fx-column">
      <div class="fx-row fx-gap-15">
        <mat-form-field class="fx-grow">
          <mat-label>Start</mat-label>
          <input matInput />
        </mat-form-field>
        <mat-form-field class="fx-grow">
          <mat-label>Step</mat-label>
          <input matInput />
        </mat-form-field>
      </div>
      <div class="fx-row fx-gap-15">
        <mat-form-field class="fx-grow">
          <mat-label>Prefix</mat-label>
          <input matInput />
        </mat-form-field>
        <mat-form-field class="fx-grow">
          <mat-label>Suffix</mat-label>
          <input matInput />
        </mat-form-field>
      </div>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class AutoNumberInputComponent {}
