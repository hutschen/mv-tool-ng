import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { JiraProjectService,  IJiraProject} from './jira-project.service';

describe('JiraProjectService', () => {
  let sut: JiraProjectService;
  let crud: CRUDService<IJiraProject, IJiraProject>
  let httpMock: HttpTestingController
  let outputMock: IJiraProject

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    sut = TestBed.inject(JiraProjectService);
    crud = TestBed.inject(CRUDService)
    httpMock = TestBed.inject(HttpTestingController)
    outputMock = {
      id: '10000',
      key: 'MT',
      name: 'A test JIRA project'
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return jira projects url', () => {
    expect(sut.getJiraProjectsUrl()).toEqual('jira/projects')
  })

  it('should return jira project url', () => {
    expect(sut.getJiraProjectUrl(outputMock.id)
      ).toEqual(`jira/projects/${outputMock.id}`)
  })

  it('should list jira projects', (done: DoneFn) => {
    sut.getJiraProjects().then((value) => {
      expect(value.length).toEqual(1)
      expect(value[0]).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraProjectsUrl())
    })
    mockResponse.flush([outputMock])
  })

  it('should get jira project', (done: DoneFn) => {
    sut.getJiraProject(outputMock.id).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getJiraProjectUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })
});
