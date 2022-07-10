import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { AuthService } from './auth.service';
import { IJiraIssueType, JiraIssueTypeService } from './jira-issue-type.service';

describe('JiraIssueTypeService', () => {
  let sut: JiraIssueTypeService;
  let crud: CRUDService<IJiraIssueType, IJiraIssueType>;
  let httpMock: HttpTestingController;
  let outputMock: IJiraIssueType;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    TestBed.inject(AuthService).logIn({username: 'test', password: 'test'});
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(JiraIssueTypeService);

    outputMock = {
      id: '10000',
      name: 'A test JIRA issue type',
    }
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return jira issue types url', () => {
    const jiraProjectId = '1000'
    expect(sut.getJiraIssueTypesUrl(
      jiraProjectId)).toEqual(`jira/projects/${jiraProjectId}/issuetypes`)
  });

  it('should list jira issue types', (done: DoneFn) => {
    const jiraProjectId = '1000'
    sut.getJiraIssueTypes(jiraProjectId).then((value) => {
      expect(value).toEqual([outputMock])
      done()
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraIssueTypesUrl(jiraProjectId))
    })
    mockResponse.flush([outputMock])
  });
});
