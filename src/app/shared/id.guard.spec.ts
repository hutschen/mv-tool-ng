import {
  ActivatedRouteSnapshot, Router,
  RouterStateSnapshot } from '@angular/router';
import { ProjectIdGuard } from './id.guard';

describe('IdGuard', () => {
  let sut: ProjectIdGuard;
  let routerMock: jasmine.SpyObj<Router>;
  let stateMock: RouterStateSnapshot;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    stateMock = {url: 'test'} as RouterStateSnapshot
    sut = new ProjectIdGuard(routerMock);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return true when id is valid', () => {
    const result = sut.canActivate(
      {paramMap: {get: (_: string) => '1'}} as ActivatedRouteSnapshot, stateMock)
    expect(result).toEqual(true)
    expect(routerMock.navigate).not.toHaveBeenCalled()
  });

  it('should return false when id is negative', () => {
    const result = sut.canActivate(
      {paramMap: {get: (_: string) => '-1'}} as ActivatedRouteSnapshot, stateMock)
    expect(result).toEqual(false)
    expect(routerMock.navigate).toHaveBeenCalledWith(['/'])
  });

  it('should return false when id is not a number', () => {
    const result = sut.canActivate(
      {paramMap: {get: (_: string) => 'test'}} as ActivatedRouteSnapshot, stateMock)
    expect(result).toEqual(false)
    expect(routerMock.navigate).toHaveBeenCalledWith(['/'])
  });

});
