import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { AuthService } from './auth.service';
import {
  IJiraIssueInput,
  IJiraIssue,
  JiraIssueService,
} from './jira-issue.service';

describe('JiraIssueService', () => {
  let sut: JiraIssueService;
  let crud: CRUDService<IJiraIssueInput, IJiraIssueInput>;
  let httpMock: HttpTestingController;
  let inputMock: IJiraIssueInput;
  let outputMock: IJiraIssue;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.inject(AuthService).logIn({ username: 'test', password: 'test' });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(JiraIssueService);

    inputMock = {
      summary: 'A test JIRA issue',
      description: 'A test JIRA issue description',
      issuetype_id: '10000',
    };

    outputMock = {
      id: '10000',
      summary: inputMock.summary,
      description: inputMock.description,
      key: 'MT-1',
      url: 'https://...',
      project_id: '10000',
      issuetype_id: inputMock.issuetype_id,
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
    const jiraProjectId = outputMock.project_id;
    expect(sut.getJiraIssuesUrl(jiraProjectId)).toEqual(
      `jira-projects/${jiraProjectId}/jira-issues`
    );
  });

  it('should return jira issue url', () => {
    const jiraIssueId = outputMock.id;
    expect(sut.getJiraIssueUrl(jiraIssueId)).toEqual(
      `jira-issues/${jiraIssueId}`
    );
  });

  it('should list jira issues', (done: DoneFn) => {
    sut.getJiraIssues(outputMock.project_id).then((value) => {
      expect(value).toEqual([outputMock]);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraIssuesUrl(outputMock.project_id)),
    });
    mockResponse.flush([outputMock]);
  });

  it('should create jira issue', (done: DoneFn) => {
    const jiraProjectId = outputMock.project_id;
    sut.createJiraIssue(jiraProjectId, inputMock).then((value) => {
      expect(value).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getJiraIssuesUrl(jiraProjectId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get jira issue', (done: DoneFn) => {
    sut.getJiraIssue(outputMock.id).then((value) => {
      expect(value).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraIssueUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });
});
