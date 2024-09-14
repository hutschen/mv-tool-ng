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
import { CRUDService } from './crud.service';
import { AuthService } from './auth.service';
import {
  IJiraIssueInput,
  IJiraIssue,
  JiraIssueService,
} from './jira-issue.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('JiraIssueService', () => {
  let sut: JiraIssueService;
  let crud: CRUDService<IJiraIssueInput, IJiraIssueInput>;
  let httpMock: HttpTestingController;
  let inputMock: IJiraIssueInput;
  let outputMock: IJiraIssue;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    TestBed.inject(AuthService).setAccessToken({
      access_token: 'token',
      token_type: 'bearer',
    });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(JiraIssueService);

    inputMock = {
      summary: 'A test JIRA issue',
      description: 'A test JIRA issue description',
      assignee_id: '10000',
      issuetype_id: '10000',
    };

    outputMock = {
      id: '10000',
      summary: inputMock.summary,
      description: inputMock.description,
      key: 'MT-1',
      url: 'https://...',
      project: {
        id: '10000',
        key: 'MT',
        name: 'A test project',
        url: 'https://...',
      },
      issuetype: {
        id: inputMock.issuetype_id,
        name: 'A test issue type',
      },
      status: {
        name: 'Backlog',
        color_name: 'blue',
        completed: false,
      },
    };
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return jira issues url', () => {
    expect(sut.getJiraIssuesUrl()).toEqual('jira-issues');
  });

  it('should return jira issue url', () => {
    const measureId = 1;
    expect(sut.getJiraIssueUrl(measureId)).toEqual(
      `measures/${measureId}/jira-issue`
    );
  });

  it('should query jira issues', (done: DoneFn) => {
    sut.queryJiraIssues().subscribe({
      next: (value) => expect(value).toEqual([outputMock]),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraIssuesUrl()),
    });
    mockResponse.flush([outputMock]);
  });

  it('should create jira issue', (done: DoneFn) => {
    const measureId = 1;
    sut.createAndLinkJiraIssue(measureId, inputMock).subscribe({
      next: (value) => expect(value).toEqual(outputMock),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getJiraIssueUrl(measureId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get jira issue', (done: DoneFn) => {
    const measureId = 1;
    sut.getJiraIssue(measureId).subscribe({
      next: (value) => expect(value).toEqual(outputMock),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraIssueUrl(measureId)),
    });
    mockResponse.flush(outputMock);
  });
});
