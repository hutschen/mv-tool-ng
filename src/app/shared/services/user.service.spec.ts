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
import { HttpRequest } from '@angular/common/http';

describe('UserService', () => {
  let sut: UserService;
  let crud: CRUDService<IUser, IUser>;
  let httpMock: HttpTestingController;
  let outputMock: IUser;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.inject(AuthService).setAccessToken({
      access_token: 'token',
      token_type: 'bearer',
    });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(UserService);

    outputMock = {
      id: 'id',
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

  it('should return url to search users', () => {
    const jiraProjectId = '1000';
    expect(sut.getSearchUsersUrl(jiraProjectId)).toEqual(
      `jira-projects/${jiraProjectId}/jira-users`
    );
  });

  it('should return users url', () => {
    expect(sut.getUsersUrl()).toEqual('jira-users');
  });

  it('should return user url', () => {
    expect(sut.getUserUrl()).toEqual('jira-user');
  });

  it('should get user', (done: DoneFn) => {
    sut.getUser().subscribe({
      next: (value) => expect(value).toEqual(outputMock),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getUserUrl()),
    });
    mockResponse.flush(outputMock);
  });

  it('should search users', (done: DoneFn) => {
    const jiraProjectId = '1000';
    const searchStr = 'test';
    sut.searchUsers(jiraProjectId, searchStr, {}).subscribe({
      next: (value) => expect(value).toEqual([outputMock]),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url:
        crud.toAbsoluteUrl(sut.getSearchUsersUrl(jiraProjectId)) +
        `?search=${searchStr}`,
    });
    mockResponse.flush([outputMock]);
  });

  it('should get specific users', (done: DoneFn) => {
    const userIds = ['id1', 'id2'];
    sut.getSpecificUsers(...userIds).subscribe({
      next: (value) => expect(value).toEqual([outputMock]),
      complete: done,
    });

    const mockResponse = httpMock.expectOne((req: HttpRequest<any>) => {
      const ids = new Set(req.params.getAll('ids'));
      if (
        req.url !== crud.toAbsoluteUrl(sut.getUsersUrl()) ||
        req.method !== 'GET' ||
        ids.size !== userIds.length ||
        !userIds.every((id) => ids.has(id))
      ) {
        return false;
      }
      return true;
    });

    mockResponse.flush([outputMock]);
  });
});
