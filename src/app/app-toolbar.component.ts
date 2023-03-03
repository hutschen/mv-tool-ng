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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mvtool-app-toolbar',
  template: `
    <mat-toolbar color="primary">
      <div class="margin-l-toolbar-first-child">MV-Tool</div>
      <ng-content></ng-content>
      <div class="spacer"></div>
      <mvtool-user-menu
        class="margin-r-toolbar-last-child"
        (loggedOut)="onLoggedOut()"
      ></mvtool-user-menu>
    </mat-toolbar>
  `,
  styleUrls: ['shared/styles/spacing.scss'],
  styles: ['.spacer { flex: 1 1 auto; }'],
})
export class AppToolbarComponent implements OnInit {
  constructor(protected _router: Router) {}

  onLoggedOut() {
    this._router.navigate(['/login']);
  }

  ngOnInit(): void {}
}
