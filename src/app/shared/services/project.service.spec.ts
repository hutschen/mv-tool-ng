import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { ProjectService, IProjectInput, IProject } from './project.service';

describe('ProjectService', () => {
  let sut: ProjectService;
  let crudMock: CRUDService<IProjectInput, IProject>
  let httpMock: HttpTestingController;
  let inputMock: IProjectInput
  let outputMock: IProject

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    sut = TestBed.inject(ProjectService);
    crudMock = TestBed.inject(CRUDService)
    httpMock = TestBed.inject(HttpTestingController)
    inputMock = {
      name: 'A test project',
    }
    outputMock = {
      id: 1,
      name: inputMock.name,
      jira_project: null
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return projects url', () => {
    expect(sut.getProjectsUrl()).toEqual('projects')
  })

  it('should return project url', () => {
    expect(sut.getProjectUrl(outputMock.id)
      ).toEqual(`projects/${outputMock.id}`)
  })

  it('should list projects', (done: DoneFn) => {
    sut.listProjects().then((value) => {
      expect(value.length).toEqual(1)
      expect(value[0]).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crudMock.toAbsoluteUrl(sut.getProjectsUrl())
    })
    mockResponse.flush([outputMock])
  })

  it('should create project', (done: DoneFn) => {
    sut.createProject(inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crudMock.toAbsoluteUrl(sut.getProjectsUrl())
    })
    mockResponse.flush(outputMock)
  })

  it('should get a project', (done: DoneFn) => {
    sut.getProject(outputMock.id).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crudMock.toAbsoluteUrl(sut.getProjectUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should update a project', (done: DoneFn) => {
    sut.updateProject(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crudMock.toAbsoluteUrl(sut.getProjectUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should delete a project', (done: DoneFn) => {
    sut.deleteProject(outputMock.id).then((value) => {
      expect(value).toBeNull()
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crudMock.toAbsoluteUrl(sut.getProjectUrl(outputMock.id))
    })
    mockResponse.flush(null)
  })
});
