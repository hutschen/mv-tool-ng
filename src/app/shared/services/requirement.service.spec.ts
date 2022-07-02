import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { 
  RequirementService, 
  IRequirementInput, IRequirement, Requirement } from './requirement.service';
import { AuthService } from './auth.service';

describe('RequirementService', () => {
  let sut: RequirementService;
  let crud: CRUDService<IRequirementInput, IRequirement>
  let httpMock: HttpTestingController
  let inputMock: IRequirementInput
  let outputMock: IRequirement

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
    TestBed.inject(AuthService).logIn({username: 'test', password: 'test'})
    crud = TestBed.inject(CRUDService)
    httpMock = TestBed.inject(HttpTestingController)
    sut = TestBed.inject(RequirementService)

    inputMock = {
      reference: null,
      summary: 'A test requirement',
      description: 'A test requirement description',
      target_object: null,
      compliance_status: null,
      compliance_comment: null,
    }
    outputMock = {
      id: 1,
      reference: inputMock.reference,
      summary: inputMock.summary,
      description: inputMock.description,
      target_object: inputMock.target_object,
      compliance_status: inputMock.compliance_status,
      compliance_comment: inputMock.compliance_comment,
      project: {
        id: 1,
        name: 'A test project'
      }
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return requirements url', () => {
    const projectId = outputMock.project.id
    expect(sut.getRequirementsUrl(projectId)
      ).toEqual(`projects/${projectId}/requirements`)
  })

  it('should return requirement url', () => {
    const requirementId = outputMock.id
    expect(sut.getRequirementUrl(requirementId)
      ).toEqual(`requirements/${requirementId}`)
  })

  it('should list requirements', (done: DoneFn) => {
    const projectId = outputMock.project.id
    const requirementsList = [outputMock]

    sut.listRequirements(projectId).then((value) => {
      expect(value).toEqual(
        requirementsList.map(requirement => new Requirement(requirement)))
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getRequirementsUrl(projectId))
    })
    mockResponse.flush(requirementsList)
  })

  it('should create requirement', (done: DoneFn) => {
    const projectId = outputMock.project.id
    
    sut.createRequirement(projectId, inputMock).then((value) => {
      expect(value).toEqual(new Requirement(outputMock))
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getRequirementsUrl(projectId))
    })
    mockResponse.flush(outputMock)
  })

  it('should get a requirement', (done: DoneFn) => {
    sut.getRequirement(outputMock.id).then((value) => {
      expect(value).toEqual(new Requirement(outputMock))
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getRequirementUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should update a requirement', (done: DoneFn) => {
    sut.updateRequirement(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(new Requirement(outputMock))
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getRequirementUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should delete a requirement', (done: DoneFn) => {
    sut.deleteRequirement(outputMock.id).then((value) => {
      expect(value).toBeNull()
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getRequirementUrl(outputMock.id))
    })
    mockResponse.flush(null)
  })
});
