import { CRUDService } from './crud.service';
import { ProjectService } from './project.service';
import { 
  IRequirementInput, IRequirement, 
  RequirementService } from './requirement.service';

describe('RequirementService', () => {
  let sut: RequirementService;
  let crudMock: jasmine.SpyObj<CRUDService<any, any>>
  let projectsMock: jasmine.SpyObj<ProjectService>
  let inputMock: IRequirementInput
  let outputMock: IRequirement


  beforeEach(() => {
    crudMock = jasmine.createSpyObj([
      'toAbsoluteUrl', 'list', 'create', 'read', 'update', 'delete'])
    projectsMock = jasmine.createSpyObj([
      'getProjectsUrl', 'getProjectUrl', 'listProjects', 'createProject', 
      'getProject', 'updateProject', 'deleteProject'])
    inputMock = {
      summary: 'A test requirement'
    }
    outputMock = {
      id: 1,
      summary: inputMock.summary,
      project: {
        id: 1,
        name: 'A test project'
      }
    }
    sut = new RequirementService(crudMock, projectsMock)
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return requirements url', () => {
    const projectId = outputMock.project.id
    projectsMock.getProjectUrl.and.returnValue(`projects/${projectId}`)
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
    crudMock.list.and.returnValue(Promise.resolve(requirementsList))
    projectsMock.getProjectUrl.and.returnValue(`projects/${projectId}`)
    
    sut.listRequirements(projectId).then((value) => {
      expect(value).toEqual(requirementsList)
      expect(projectsMock.getProjectUrl).toHaveBeenCalledWith(projectId)
      expect(crudMock.list).toHaveBeenCalledWith(sut.getRequirementsUrl(projectId))
      done()
    })
  })
});
