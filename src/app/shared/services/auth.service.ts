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

import { EventEmitter, Injectable } from '@angular/core';
import { UnauthorizedError } from '../errors';

export interface ICredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static STORAGE_KEY = 'credentials';
  loggedIn = new EventEmitter<void>();
  loggedOut = new EventEmitter<void>();

  constructor() {}

  logIn(credentials: ICredentials, keepLoggedIn = false) {
    let storage: Storage = keepLoggedIn ? localStorage : sessionStorage;
    storage.setItem(AuthService.STORAGE_KEY, JSON.stringify(credentials));
    this.loggedIn.emit();
  }

  protected get _storage(): Storage {
    if (localStorage.getItem(AuthService.STORAGE_KEY)) {
      return localStorage;
    } else {
      return sessionStorage;
    }
  }

  get isLoggedIn(): boolean {
    return Boolean(this._storage.getItem(AuthService.STORAGE_KEY));
  }

  logOut() {
    if (this._storage.getItem(AuthService.STORAGE_KEY)) {
      this._storage.removeItem(AuthService.STORAGE_KEY);
    }
    this.loggedOut.emit();
  }

  public get credentials(): ICredentials {
    let credentials = this._storage.getItem(AuthService.STORAGE_KEY);
    if (credentials) {
      return <ICredentials>JSON.parse(credentials);
    } else {
      throw new UnauthorizedError('User is not logged in.');
    }
  }
}
