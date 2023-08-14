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
import { BehaviorSubject, debounce, shareReplay, startWith, timer } from 'rxjs';

@Component({
  selector: 'mvtool-loading-overlay',
  template: `
    <div
      class="overlay-container"
      [ngClass]="overlayType"
      [class.overlay-active]="loading$ | async"
    >
      <ng-content></ng-content>
      <div class="overlay-background" *ngIf="loading$ | async">
        <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay-container {
        position: relative;
      }
      .overlay-container.block {
        display: flex;
      }
      .overlay-container.inline {
        display: inline-flex;
      }
      .overlay-background {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10;
      }
      .overlay-active {
        overflow: hidden;
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  @Input() diameter: number = 20;
  @Input() color: string = 'primary';
  @Input() delay: number = 500;
  @Input() overlayType: 'block' | 'inline' = 'inline';

  // Use a BehaviorSubject to implement the isLoading getter. Then debounce the
  // loading state to not show the loading indicator when the loading process is
  // is fast.
  protected _loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loadingSubject.pipe(
    debounce(() => timer(this.delay)),
    startWith(this._loadingSubject.value),
    shareReplay(1)
  );

  @Input()
  set isLoading(loading: boolean) {
    this._loadingSubject.next(loading);
  }

  get isLoading(): boolean {
    return this._loadingSubject.value;
  }
}
