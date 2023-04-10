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

import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { ProjectIdGuard } from './id.guard';

describe('IdGuard', () => {
  let sut: ProjectIdGuard;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    sut = new ProjectIdGuard(routerMock);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return true when id is valid', () => {
    const result = sut.canActivate({
      paramMap: { get: (_: string) => '1' },
    } as ActivatedRouteSnapshot);
    expect(result).toEqual(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should return false when id is negative', () => {
    const result = sut.canActivate({
      paramMap: { get: (_: string) => '-1' },
    } as ActivatedRouteSnapshot);
    expect(result).toEqual(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return false when id is not a number', () => {
    const result = sut.canActivate({
      paramMap: { get: (_: string) => 'test' },
    } as ActivatedRouteSnapshot);
    expect(result).toEqual(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
