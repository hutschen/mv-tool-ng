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
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { UserService, IUser } from './user.service';
import { AuthService } from './auth.service';

describe('UserService', () => {
  let sut: UserService;
  let crud: CRUDService<IUser, IUser>;
  let httpMock: HttpTestingController;
  let outputMock: IUser;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.inject(AuthService).logIn({ username: 'test', password: 'test' });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(UserService);

    outputMock = {
      display_name: 'Firstname Lastname',
      email_address: 'firstname.lastname@domain',
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return user url', () => {
    expect(sut.getUserUrl()).toEqual('jira-user');
  });

  it('should get user', (done: DoneFn) => {
    sut.getUser().then((value) => {
      expect(value).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getUserUrl()),
    });
    mockResponse.flush(outputMock);
  });
});
