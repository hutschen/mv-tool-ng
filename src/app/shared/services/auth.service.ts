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

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnauthorizedError } from '../errors';
import { Router } from '@angular/router';

export interface ICredentials {
  username: string;
  password: string;
}

export interface IAccessToken {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static STORAGE_KEY = 'auth';
  public redirectUrl: string = '/';
  loggedIn = new EventEmitter<void>();
  loggedOut = new EventEmitter<void>();

  constructor(protected _httpClient: HttpClient, protected _router: Router) {}

  logIn(credentials: ICredentials, keepLoggedIn = false): Observable<boolean> {
    // Prepare request form
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');

    // Send request
    return this._httpClient
      .post<IAccessToken>(environment.authUrl, formData)
      .pipe(
        tap((accessToken) => {
          this.setAccessToken(accessToken, keepLoggedIn);
          this._router.navigateByUrl(this.redirectUrl);
        }),
        map(() => true),
        catchError((error) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return of(false);
          } else {
            throw error;
          }
        })
      );
  }

  public setAccessToken(accessToken: IAccessToken, keepLoggedIn = false) {
    const storage: Storage = keepLoggedIn ? localStorage : sessionStorage;
    storage.setItem(AuthService.STORAGE_KEY, JSON.stringify(accessToken));
    this.loggedIn.emit();
  }

  protected get _storage(): Storage {
    if (localStorage.getItem(AuthService.STORAGE_KEY)) {
      return localStorage;
    } else {
      return sessionStorage;
    }
  }

  public get accessToken(): IAccessToken {
    let accessToken = this._storage.getItem(AuthService.STORAGE_KEY);
    if (accessToken) {
      return <IAccessToken>JSON.parse(accessToken);
    } else {
      throw new UnauthorizedError('User is not logged in.');
    }
  }

  get isLoggedIn(): boolean {
    return Boolean(this._storage.getItem(AuthService.STORAGE_KEY));
  }

  logOut() {
    if (this._storage.getItem(AuthService.STORAGE_KEY)) {
      this._storage.removeItem(AuthService.STORAGE_KEY);
      this.redirectUrl = this._router.url;
    }
    this.loggedOut.emit();
  }
}
