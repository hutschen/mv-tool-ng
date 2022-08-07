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
      description: 'A test measure description',
      completed: false,
      jira_issue_id: null,
      jira_issue: null,
      document: null,
      requirement: {
        id: 1,
        reference: null,
        summary: 'A test requirement',
        description: 'A test requirement description',
        target_object: null,
        compliance_status: null,
        compliance_comment: null,
        project: {
          id: 1,
          name: 'A test project',
          description: 'A test project description',
          jira_project_id: null,
          jira_project: null,
          completion: 0,
        },
        completion: 0,
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
    expect(sut.hasJiraIssue).toBeFalse();
    sut.jira_issue = jiraIssueMock;
    expect(sut.hasJiraIssue).toBeTrue();
    sut.jira_issue_id = '10000';
    expect(sut.hasJiraIssue).toBeTrue();
    sut.jira_issue = null;
    expect(sut.hasJiraIssue).toBeTrue();
    sut.jira_issue_id = null;
    expect(sut.hasJiraIssue).toBeFalse();
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
    TestBed.inject(AuthService).logIn({ username: 'test', password: 'test' });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(MeasureService);

    inputMock = {
      summary: 'A test measure',
      description: 'A test measure description',
      completed: false,
      jira_issue_id: '10000',
      document_id: null,
    };
    outputMock = {
      id: 1,
      summary: inputMock.summary,
      description: inputMock.description,
      completed: inputMock.completed,
      jira_issue_id: inputMock.jira_issue_id,
      jira_issue: null,
      document: null,
      requirement: {
        id: 1,
        reference: null,
        summary: 'A test requirement',
        description: 'A test requirement description',
        target_object: null,
        compliance_status: null,
        compliance_comment: null,
        project: {
          id: 1,
          name: 'A test project',
          description: 'A test project description',
          jira_project_id: null,
          jira_project: null,
          completion: 0,
        },
        completion: 0,
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

  it('should list measures', (done: DoneFn) => {
    const requirementId = outputMock.requirement.id;
    const measuresList = [outputMock];

    sut.listMeasures(requirementId).then((value) => {
      expect(value).toEqual(
        measuresList.map((measure) => new Measure(measure))
      );
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getMeasuresUrl(requirementId)),
    });
    mockResponse.flush(measuresList);
  });

  it('should create measure', (done: DoneFn) => {
    const requirementId = outputMock.requirement.id;

    sut.createMeasure(requirementId, inputMock).then((value) => {
      expect(value).toEqual(new Measure(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getMeasuresUrl(requirementId)),
    });
    mockResponse.flush(outputMock);
  });

  it('should get measure', (done: DoneFn) => {
    sut.getMeasure(outputMock.id).then((value) => {
      expect(value).toEqual(new Measure(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should update measure', (done: DoneFn) => {
    sut.updateMeasure(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(new Measure(outputMock));
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id)),
    });
    mockResponse.flush(outputMock);
  });

  it('should delete measure', (done: DoneFn) => {
    sut.deleteMeasure(outputMock.id).then((value) => {
      expect(value).toBeNull();
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id)),
    });
    mockResponse.flush(null);
  });
});
