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
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'mvtool-user-login',
  templateUrl: './user-login.component.html',
  styles: [],
})
export class UserLoginComponent {
  @Output() loggedIn = new EventEmitter<void>();
  hidePassword: boolean = true;
  keepLoggedIn: boolean = false;
  credentials = {
    username: '',
    password: '',
  };

  constructor(protected _auth: AuthService, protected _user: UserService) {}

  onReset() {
    this.keepLoggedIn = false;
    this.credentials = {
      username: '',
      password: '',
    };
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.valid) {
      this._auth.logIn(this.credentials, this.keepLoggedIn);
      try {
        await this._user.getUser();
      } catch (error) {
        this._auth.logOut();
        this.onReset();
        throw error;
      }
      this.loggedIn.emit();
    }
  }
}
