import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { UnauthorizedError } from '../errors';
import { AuthService, ICredentials } from './auth.service';

describe('AuthService', () => {
  let sut: AuthService;
  let credentials: ICredentials;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sut = TestBed.inject(AuthService);
    credentials = environment.credentials
    
    if (sut.isLoggedIn) {
      sut.logOut()
      expect(sut.isLoggedIn).toBeFalse()
    }
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should log in', () => {
    sut.logIn(credentials)
    expect(sut.isLoggedIn).toBeTrue()
    expect(sut.credentials).toEqual(credentials)
  })

  it('should return credentials', () => {
    sut.logIn(credentials)
    expect(sut.credentials).toEqual(credentials)
  })

  it('should log out', () => {
    sut.logIn(credentials)
    sut.logOut()
    expect(sut.isLoggedIn).toBeFalse()
    expect( () => { sut.credentials }).toThrowError(UnauthorizedError)
  })
});