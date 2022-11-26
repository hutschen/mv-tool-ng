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
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'mvtool-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['../shared/styles/flex.css'],
  styles: [],
})
export class UserLoginComponent {
  @Output() loggedIn: EventEmitter<void>;
  hidePassword: boolean = true;
  keepLoggedIn: boolean = false;
  credentials = {
    username: '',
    password: '',
  };

  constructor(protected _auth: AuthService, protected _snackBar: MatSnackBar) {
    this.loggedIn = this._auth.loggedIn;
  }

  onReset() {
    this.keepLoggedIn = false;
    this.credentials = {
      username: '',
      password: '',
    };
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.valid) {
      const loggedIn = await firstValueFrom(
        this._auth.logIn(this.credentials, this.keepLoggedIn)
      );
      if (!loggedIn) {
        this._snackBar.open(
          'Log in failed. Please try to log in again.',
          'Close',
          { duration: 10 * 1000 }
        );
        this.onReset();
      }
    }
  }
}
