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
import {
  MeasureService,
  IMeasureInput,
  IMeasure,
  Measure,
} from './measure.service';
import { AuthService } from './auth.service';
import { IJiraIssue } from './jira-issue.service';

describe('Measure', () => {
  let sut: Measure;
  let jiraIssueMock: IJiraIssue;

  beforeEach(() => {
    sut = new Measure({
      id: 1,
      summary: 'A test measure',
      verified: false,
      requirement: {
        id: 1,
        summary: 'A test requirement',
        project: {
          id: 1,
          name: 'A test project',
        },
      },
    });
    jiraIssueMock = {
      id: '10000',
      summary: 'A test issue',
      description: 'A test issue description',
      key: 'MT-1',
      url: 'https://...',
      project_id: '10000',
      issuetype_id: '10000',
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

  it('should check if JIRA issue is assigned', () => {
    expect(sut.hasLinkedJiraIssue).toBeFalse();
    sut.jira_issue = jiraIssueMock;
    expect(sut.hasLinkedJiraIssue).toBeTrue();
    sut.jira_issue_id = '10000';
    expect(sut.hasLinkedJiraIssue).toBeTrue();
    sut.jira_issue = null;
    expect(sut.hasLinkedJiraIssue).toBeTrue();
    sut.jira_issue_id = null;
    expect(sut.hasLinkedJiraIssue).toBeFalse();
  });

  it('should check that user is permitted to view JIRA issue', () => {
    expect(sut.hasPermissionOnJiraIssue).toBeTrue();
    sut.jira_issue_id = '10000';
    sut.jira_issue = jiraIssueMock;
    expect(sut.hasPermissionOnJiraIssue).toBeTrue();
  });

  it('should check that user is not permitted to view JIRA issue', () => {
    expect(sut.hasPermissionOnJiraIssue).toBeTrue();
    sut.jira_issue_id = '10000';
    expect(sut.hasPermissionOnJiraIssue).toBeFalse();
  });
});

describe('MeasureService', () => {
  let sut: MeasureService;
  let crud: CRUDService<IMeasureInput, IMeasure>;
  let httpMock: HttpTestingController;
  let inputMock: IMeasureInput;
  let outputMock: IMeasure;

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
    sut = TestBed.inject(MeasureService);

    inputMock = {
      summary: 'A test measure',
      description: 'A test measure description',
      verified: false,
      jira_issue_id: null,
      document_id: null,
    };
    outputMock = {
      id: 1,
      summary: inputMock.summary,
      description: inputMock.description,
      verified: inputMock.verified,
      jira_issue_id: '10000',
      jira_issue: null,
      document: null,
      requirement: {
        id: 1,
        summary: 'A test requirement',
        project: {
          id: 1,
          name: 'A test project',
          description: 'A test project description',
          jira_project_id: null,
          jira_project: null,
          completion: 0,
        },
      },
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return measures url', () => {
    const requirementId = outputMock.requirement.id;
    expect(sut.getMeasuresUrl(requirementId)).toEqual(
      `requirements/${requirementId}/measures`
    );
  });

  it('should return measure url', () => {
    const measureId = outputMock.id;
    expect(sut.getMeasureUrl(measureId)).toEqual(`measures/${measureId}`);
  });

  it('should query measures', (done: DoneFn) => {
    const requirementId = outputMock.requirement.id;
    const measuresList = [outputMock];

    sut.queryMeasures({ requirement_id: requirementId }).subscribe({
      next: (value) =>
        expect(value as Measure[]).toEqual(
          measuresList.map((measure) => new Measure(measure))
        ),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getMeasuresUrl(requirementId)),
    });
    mockResponse.flush(measuresList);
  });

  it('should create measure', (done: DoneFn) => {
    const requirementId = outputMock.requirement.id;

    sut.createMeasure(requirementId, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Measure(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getMeasuresUrl(requirementId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get measure', (done: DoneFn) => {
    sut.getMeasure(outputMock.id).subscribe({
      next: (value) => expect(value).toEqual(new Measure(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update measure', (done: DoneFn) => {
    sut.updateMeasure(outputMock.id, inputMock).subscribe({
      next: (value) => expect(value).toEqual(new Measure(outputMock)),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should delete measure', (done: DoneFn) => {
    sut
      .deleteMeasure(outputMock.id)
      .subscribe({ next: (value) => expect(value).toBeNull(), complete: done });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });
});
