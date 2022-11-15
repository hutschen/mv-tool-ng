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

import { HttpClient } from '@angular/common/http';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService, IAccessToken } from './shared/services/auth.service';

describe('AuthGuard', () => {
  let sut: AuthGuard;
  let auth: AuthService;
  let routerMock: jasmine.SpyObj<Router>;
  let accessToken: IAccessToken;
  let routeMock: ActivatedRouteSnapshot;
  let stateMock: RouterStateSnapshot;

  beforeEach(() => {
    auth = new AuthService({} as HttpClient);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    sut = new AuthGuard(auth, routerMock);

    accessToken = { access_token: 'token', token_type: 'bearer' };
    routeMock = {} as ActivatedRouteSnapshot;
    stateMock = { url: 'test' } as RouterStateSnapshot;

    if (auth.isLoggedIn) {
      auth.logOut();
      expect(auth.isLoggedIn).toBeFalse();
    }
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should recognize logged in user', () => {
    auth.setAccessToken(accessToken);
    const result = sut.canActivate(routeMock, stateMock);
    expect(result).toEqual(auth.isLoggedIn);
    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should recognize logged out user', () => {
    auth.logOut();
    const result = sut.canActivate(routeMock, stateMock);
    expect(result).toEqual(auth.isLoggedIn);
    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
