import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { TaskService, ITaskInput, ITask } from './task.service';

describe('TaskService', () => {
  let sut: TaskService;
  let crud: CRUDService<ITaskInput, ITask>
  let httpMock: HttpTestingController
  let inputMock: ITaskInput
  let outputMock: ITask

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    sut = TestBed.inject(TaskService);
    crud = TestBed.inject(CRUDService)
    httpMock = TestBed.inject(HttpTestingController)
    inputMock = {
      summary: 'A test task'
    }
    outputMock = {
      id: 1,
      summary: inputMock.summary,
      measure: {
        id: 1,
        summary: 'A test measure',
        requirement: {
          id: 1,
          summary: 'A test requirement',
          project: {
            id: 1,
            name: 'A test project'
          }
        }
      },
      document: null
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return tasks url', () => {
    const measureId = outputMock.measure.id
    expect(sut.getTasksUrl(measureId)).toEqual(`measures/${measureId}/tasks`)
  })

  it('should return task url', () => {
    const taskId = outputMock.id
    expect(sut.getTaskUrl(taskId)).toEqual(`tasks/${taskId}`)
  })

  it('should list tasks', (done: DoneFn) => {
    const measureId = outputMock.measure.id
    const tasksList = [outputMock]

    sut.listTasks(measureId).then((value) => {
      expect(value).toEqual(tasksList)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getTasksUrl(measureId))
    })
    mockResponse.flush(tasksList)
  })

  it('should create task', (done: DoneFn) => {
    const measureId = outputMock.measure.id

    sut.createTask(measureId, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getTasksUrl(measureId))
    })
    mockResponse.flush(outputMock)
  })
  
  it('should get task', (done: DoneFn) => {
    sut.getTask(outputMock.id).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getTaskUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })
  
  it('should update task', (done: DoneFn) => {
    sut.updateTask(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getTaskUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  xit('should delete task', (done: DoneFn) => {
    sut.deleteTask(outputMock.id).then((value) => {
      expect(value).toBeNull()
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getTaskUrl(outputMock.id))
    })
    mockResponse.flush(null)
  })
});
