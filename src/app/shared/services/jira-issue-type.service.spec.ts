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
import { AuthService } from './auth.service';
import {
  IJiraIssueType,
  JiraIssueTypeService,
} from './jira-issue-type.service';

describe('JiraIssueTypeService', () => {
  let sut: JiraIssueTypeService;
  let crud: CRUDService<IJiraIssueType, IJiraIssueType>;
  let httpMock: HttpTestingController;
  let outputMock: IJiraIssueType;

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
    sut = TestBed.inject(JiraIssueTypeService);

    outputMock = {
      id: '10000',
      name: 'A test JIRA issue type',
    };
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return jira issue types url', () => {
    const jiraProjectId = '1000';
    expect(sut.getJiraIssueTypesUrl(jiraProjectId)).toEqual(
      `jira-projects/${jiraProjectId}/jira-issuetypes`
    );
  });

  it('should list jira issue types', (done: DoneFn) => {
    const jiraProjectId = '1000';
    sut.getJiraIssueTypes(jiraProjectId).then((value) => {
      expect(value).toEqual([outputMock]);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraIssueTypesUrl(jiraProjectId)),
    });
    mockResponse.flush([outputMock]);
  });
});
