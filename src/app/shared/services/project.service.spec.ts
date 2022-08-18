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
  ProjectService,
  IProjectInput,
  IProject,
  Project,
} from './project.service';
import { AuthService } from './auth.service';
import { IJiraProject } from './jira-project.service';

describe('Project', () => {
  let sut: Project;
  let jiraProjectMock: IJiraProject;

  beforeEach(() => {
    sut = new Project({
      id: 1,
      name: 'A test project',
      description: 'A test project description',
      jira_project_id: null,
      jira_project: null,
      completion: 0,
    });
    jiraProjectMock = {
      id: '10000',
      key: 'TEST',
      name: 'A test project',
      url: 'https://...',
    };
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should check if JIRA project is assigned', () => {
    expect(sut.hasJiraProject).toBeFalse();
    sut.jira_project = jiraProjectMock;
    expect(sut.hasJiraProject).toBeTrue();
    sut.jira_project_id = '10000';
    expect(sut.hasJiraProject).toBeTrue();
    sut.jira_project = null;
    expect(sut.hasJiraProject).toBeTrue();
    sut.jira_project_id = null;
    expect(sut.hasJiraProject).toBeFalse();
  });

  it('should check that user is permitted to view JIRA project', () => {
    expect(sut.hasPermissionOnJiraProject).toBeTrue();
    sut.jira_project_id = '10000';
    sut.jira_project = jiraProjectMock;
    expect(sut.hasPermissionOnJiraProject).toBeTrue();
  });

  it('should check that user is not permitted to view JIRA project', () => {
    expect(sut.hasPermissionOnJiraProject).toBeTrue();
    sut.jira_project_id = '10000';
    expect(sut.hasPermissionOnJiraProject).toBeFalse();
  });
});

describe('ProjectService', () => {
  let sut: ProjectService;
  let crud: CRUDService<IProjectInput, IProject>;
  let httpMock: HttpTestingController;
  let inputMock: IProjectInput;
  let outputMock: IProject;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.inject(AuthService).logIn({ username: 'test', password: 'test' });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(ProjectService);

    inputMock = {
      name: 'A test project',
      description: 'A test project description',
      jira_project_id: null,
    };
    outputMock = {
      id: 1,
      name: inputMock.name,
      description: inputMock.description,
      jira_project_id: inputMock.jira_project_id,
      jira_project: null,
      completion: 0,
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return projects url', () => {
    expect(sut.getProjectsUrl()).toEqual('projects');
  });

  it('should return project url', () => {
    expect(sut.getProjectUrl(outputMock.id)).toEqual(
      `projects/${outputMock.id}`
    );
  });

  it('should list projects', (done: DoneFn) => {
    const projectList = [outputMock];
    sut.listProjects().then((value) => {
      expect(value).toEqual(projectList.map((project) => new Project(project)));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getProjectsUrl()),
    });
    mockResponse.flush(projectList);
  });

  it('should create project', (done: DoneFn) => {
    sut.createProject(inputMock).then((value) => {
      expect(value).toEqual(new Project(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getProjectsUrl()),
    });
    mockResponse.flush(outputMock);
  });

  it('should get a project', (done: DoneFn) => {
    sut.getProject(outputMock.id).then((value) => {
      expect(value).toEqual(new Project(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getProjectUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update a project', (done: DoneFn) => {
    sut.updateProject(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(new Project(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getProjectUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should delete a project', (done: DoneFn) => {
    sut.deleteProject(outputMock.id).then((value) => {
      expect(value).toBeNull();
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getProjectUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });
});
