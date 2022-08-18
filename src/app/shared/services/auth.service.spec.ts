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

import { TestBed } from '@angular/core/testing';
import { UnauthorizedError } from '../errors';
import { AuthService, ICredentials } from './auth.service';

describe('AuthService', () => {
  let sut: AuthService;
  let credentials: ICredentials;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sut = TestBed.inject(AuthService);
    credentials = { username: 'username', password: 'password' };

    if (sut.isLoggedIn) {
      sut.logOut();
      expect(sut.isLoggedIn).toBeFalse();
    }
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should log in', () => {
    sut.logIn(credentials);
    expect(sut.isLoggedIn).toBeTrue();
    expect(sut.credentials).toEqual(credentials);
  });

  it('should return credentials', () => {
    sut.logIn(credentials);
    expect(sut.credentials).toEqual(credentials);
  });

  it('should log out', () => {
    sut.logIn(credentials);
    sut.logOut();
    expect(sut.isLoggedIn).toBeFalse();
    expect(() => {
      sut.credentials;
    }).toThrowError(UnauthorizedError);
  });
});
