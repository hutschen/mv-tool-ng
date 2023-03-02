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
  selector: 'mvtool-user-login-view',
  template: `
    <div class="content fx-column fx-center-center">
      <mat-card class="user-login-card">
        <mvtool-user-login (loggedIn)="onLoggedIn()"></mvtool-user-login>
      </mat-card>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['.user-login-card { width: 500px; margin: 20px; padding: 10px; }'],
})
export class UserLoginViewComponent implements OnInit {
  constructor(protected _router: Router) {}

  onLoggedIn(): void {
    this._router.navigate(['/']);
  }

  ngOnInit(): void {}
}
