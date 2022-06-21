import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { MeasureService, IMeasureInput, IMeasure } from './measure.service';

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
    sut = TestBed.inject(MeasureService);
    crud = TestBed.inject(CRUDService)
    httpMock = TestBed.inject(HttpTestingController)
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

  xit('should list measures', () => {})
  xit('should create measure', () => {})
  xit('should get measure', () => {})
  xit('should update measure', () => {})
  xit('should delete measure', () => {})
});
