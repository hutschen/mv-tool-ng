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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { IUser, UserService } from '../shared/services/user.service';

@Component({
  selector: 'mvtool-user-menu',
  template: `<!-- Display username and options when user is logged in -->
    <span *ngIf="isLoggedIn">
      <button mat-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
        {{ displayName }}
      </button>
      <mat-menu #menu="matMenu">
        <!-- button to log out -->
        <button mat-menu-item (click)="onLogOut()">
          <mat-icon>exit_to_app</mat-icon>
          Log out
        </button>
      </mat-menu>
    </span>`,
  styles: [],
})
export class UserMenuComponent implements OnInit {
  protected _user: UserService;
  protected _auth: AuthService;
  @Output() loggedOut: EventEmitter<void>;
  displayName: string = '';

  constructor(user: UserService, auth: AuthService) {
    this._user = user;
    this._auth = auth;
    this.loggedOut = auth.loggedOut;
  }

  get isLoggedIn(): boolean {
    return this._auth.isLoggedIn;
  }

  protected _onLoggedIn() {
    this._user.getUser().subscribe((user) => {
      this.displayName = user.display_name;
    });
  }

  onLogOut(): void {
    this._auth.logOut();
    this.displayName = '';
  }

  ngOnInit() {
    if (this.isLoggedIn) {
      this._onLoggedIn();
    }
    this._auth.loggedIn.subscribe(() => this._onLoggedIn());
  }
}
