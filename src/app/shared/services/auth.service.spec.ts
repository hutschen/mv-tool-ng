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
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { UnauthorizedError } from '../errors';
import { AuthService, IAccessToken, ICredentials } from './auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthService', () => {
  let sut: AuthService;
  let httpMock: HttpTestingController;
  let authUrl: string;
  let credentials: ICredentials;
  let accessToken: IAccessToken;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    sut = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    credentials = { username: 'username', password: 'password' };
    accessToken = { access_token: 'token', token_type: 'bearer' };
    authUrl = environment.authUrl;

    if (sut.isLoggedIn) {
      sut.logOut();
      expect(sut.isLoggedIn).toBeFalse();
    }
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should log in', (done: DoneFn) => {
    sut.logIn(credentials).subscribe({
      next: () => {
        expect(sut.isLoggedIn).toBeTrue();
        expect(sut.accessToken).toEqual(accessToken);
      },
      complete: done,
    });
    const mockResponse = httpMock.expectOne({ method: 'post', url: authUrl });
    mockResponse.flush(accessToken);
  });

  it('should return access token', () => {
    sut.setAccessToken(accessToken);
    expect(sut.accessToken).toEqual(accessToken);
  });

  it('should log out', () => {
    sut.setAccessToken(accessToken);
    expect(sut.isLoggedIn).toBeTrue();
    sut.logOut();
    expect(sut.isLoggedIn).toBeFalse();
    expect(() => {
      sut.accessToken;
    }).toThrowError(UnauthorizedError);
  });
});
