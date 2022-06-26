import { 
  ActivatedRouteSnapshot, Router, 
  RouterStateSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService, ICredentials } from './shared/services/auth.service';

describe('AuthGuard', () => {
  let sut: AuthGuard;
  let auth: AuthService;
  let routerMock: jasmine.SpyObj<Router>;
  let credentials: ICredentials;
  let routeMock: ActivatedRouteSnapshot;
  let stateMock: RouterStateSnapshot;

  beforeEach(() => {
    auth = new AuthService();
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    sut = new AuthGuard(auth, routerMock);

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
    expect(routerMock.navigate).not.toHaveBeenCalled()
  });

  it('should recognize logged out user', () => {
    auth.logOut()
    const result = sut.canActivate(routeMock, stateMock)
    expect(result).toEqual(auth.isLoggedIn)
    expect(result).toBeFalse()
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'])
  });

});
