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

import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'mvtool-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css'],
})
export class UserLoginComponent {
  protected _auth: AuthService;
  @Output() loggedIn: EventEmitter<void>;
  hidePassword: boolean = true;
  keepLoggedIn: boolean = false;
  credentials = {
    username: '',
    password: '',
  };

  constructor(auth: AuthService) {
    this._auth = auth;
    this.loggedIn = this._auth.loggedIn;
  }

  onReset() {
    this.keepLoggedIn = false;
    this.credentials = {
      username: '',
      password: '',
    };
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this._auth.logIn(this.credentials, this.keepLoggedIn);
    }
  }
}
