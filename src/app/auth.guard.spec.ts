import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService, ICredentials } from './shared/services/auth.service';

describe('AuthGuard', () => {
  let sut: AuthGuard;
  let auth: AuthService;
  let credentials: ICredentials;
  let routeMock: ActivatedRouteSnapshot;
  let stateMock: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    sut = TestBed.inject(AuthGuard);
    credentials = {username: 'test', password: 'test'}
    routeMock = {} as ActivatedRouteSnapshot
    stateMock = {url: 'test'} as RouterStateSnapshot

    if (auth.isLoggedIn) {
      auth.logOut()
      expect(auth.isLoggedIn).toBeFalse()
    }
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should recognize logged in user', () => {
    auth.logIn(credentials)
    const result = sut.canActivate(routeMock, stateMock)
    expect(result).toEqual(auth.isLoggedIn)
    expect(result).toBeTrue()
  });

  it('should recognize logged out user', () => {
    auth.logOut()
    const result = sut.canActivate(routeMock, stateMock)
    expect(result).toEqual(auth.isLoggedIn)
    expect(result).toBeFalse()
  });

});
