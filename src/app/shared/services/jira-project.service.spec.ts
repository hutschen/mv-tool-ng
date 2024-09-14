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
import { JiraProjectService, IJiraProject } from './jira-project.service';
import { AuthService } from './auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('JiraProjectService', () => {
  let sut: JiraProjectService;
  let crud: CRUDService<IJiraProject, IJiraProject>;
  let httpMock: HttpTestingController;
  let outputMock: IJiraProject;

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
    sut = TestBed.inject(JiraProjectService);

    outputMock = {
      id: '10000',
      key: 'MT',
      name: 'A test JIRA project',
      url: 'https://...',
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return jira projects url', () => {
    expect(sut.getJiraProjectsUrl()).toEqual('jira-projects');
  });

  it('should return jira project url', () => {
    expect(sut.getJiraProjectUrl(outputMock.id)).toEqual(
      `jira-projects/${outputMock.id}`
    );
  });

  it('should list jira projects', (done: DoneFn) => {
    sut.getJiraProjects().subscribe({
      next: (value) => {
        expect(value.length).toEqual(1);
        expect(value[0]).toEqual(outputMock);
      },
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraProjectsUrl()),
    });
    mockResponse.flush([outputMock]);
  });

  it('should get jira project', (done: DoneFn) => {
    sut.getJiraProject(outputMock.id).subscribe({
      next: (value) => expect(value).toEqual(outputMock),
      complete: done,
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraProjectUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });
});
