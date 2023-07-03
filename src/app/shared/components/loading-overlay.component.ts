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

@Component({
  selector: 'mvtool-loading-overlay',
  template: `
    <div class="overlay-container" [class.overlay-active]="!!isLoading">
      <div class="overlay-content">
        <ng-content></ng-content>
      </div>
      <div class="overlay-background" *ngIf="!!isLoading">
        <mat-spinner [diameter]="diameter"></mat-spinner>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay-container {
        position: relative;
      }
      .overlay-content {
        width: 100%;
        height: 100%;
      }
      .overlay-background {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
      }
      .overlay-active {
        overflow: hidden;
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  @Input() isLoading: any;
  @Input() diameter: number = 20;
}
