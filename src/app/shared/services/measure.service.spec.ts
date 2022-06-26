import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { MeasureService, IMeasureInput, IMeasure } from './measure.service';
import { AuthService } from './auth.service';

describe('MeasureService', () => {
  let sut: MeasureService;
  let crud: CRUDService<IMeasureInput, IMeasure>
  let httpMock: HttpTestingController
  let inputMock: IMeasureInput
  let outputMock: IMeasure

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    TestBed.inject(AuthService).logIn({username: 'test', password: 'test'})
    crud = TestBed.inject(CRUDService)
    httpMock = TestBed.inject(HttpTestingController)
    sut = TestBed.inject(MeasureService);
    
    inputMock = {
      summary: 'A test measure'
    }
    outputMock = {
      id: 1,
      summary: inputMock.summary,
      requirement: {
        id: 1,
        summary: 'A test requirement',
        project: {
          id: 1,
          name: 'A test project'
        }
      }
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should return measures url', () => {
    const requirementId = outputMock.requirement.id
    expect(sut.getMeasuresUrl(requirementId)
      ).toEqual(`requirements/${requirementId}/measures`)
  })

  it('should return measure url', () => {
    const measureId = outputMock.id
    expect(sut.getMeasureUrl(measureId)).toEqual(`measures/${measureId}`)
  })

  it('should list measures', (done: DoneFn) => {
    const requirementId = outputMock.requirement.id
    const measuresList = [outputMock]

    sut.listMeasures(requirementId).then((value) => {
      expect(value).toEqual(measuresList)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getMeasuresUrl(requirementId))
    })
    mockResponse.flush(measuresList)
  })

  it('should create measure', (done: DoneFn) => {
    const requirementId = outputMock.requirement.id
    
    sut.createMeasure(requirementId, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getMeasuresUrl(requirementId))
    })
    mockResponse.flush(outputMock)
  })

  it('should get measure', (done: DoneFn) => {
    sut.getMeasure(outputMock.id).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should update measure', (done: DoneFn) => {
    sut.updateMeasure(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should delete measure', (done: DoneFn) => {
    sut.deleteMeasure(outputMock.id).then((value) => {
      expect(value).toBeNull()
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getMeasureUrl(outputMock.id))
    })
    mockResponse.flush(null)
  })
});
