import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import { CRUDService } from './crud.service';
import { environment } from 'src/environments/environment';
import { __values } from 'tslib';

interface IItemInput {
    name: string
}

interface IItemOutput extends IItemInput {
    id: number
}

describe('CRUDService', () => {
  let sut: CRUDService<IItemInput, IItemOutput>;
  let httpMock: HttpTestingController;
  let baseUrl: string
  let mockInput: IItemInput
  let mockOutput: IItemOutput

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
    });
    sut = TestBed.inject(CRUDService<IItemInput, IItemOutput>);
    httpMock = TestBed.inject(HttpTestingController);
    baseUrl = environment.baseUrl
    mockInput = {
        name: 'A test item'
    }
    mockOutput = {
        id: 1,
        name: mockInput.name
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should list items', (done: DoneFn) => {
    sut.list('items').then((value) => {
        expect(value.length).toEqual(1)
        expect(value[0]).toEqual(mockOutput)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'get', 
        url: baseUrl + '/items'
    })
    mockResponse.flush([mockOutput])
  });

  it('should create an item', (done: DoneFn) => {
    sut.create('items', mockInput).then((value) => {
        expect(value).toEqual(mockOutput)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'post',
        url: baseUrl + '/items'
    })
    mockResponse.flush(mockOutput)
  })

  it('should read an item', (done: DoneFn) => {
    sut.read('items/1').then((value) => {
        expect(value).toEqual(mockOutput)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'get',
        url: baseUrl + '/items/1'
    })
    mockResponse.flush(mockOutput)
  })

  it('should update an item', (done: DoneFn) => {
    sut.update('items/1', mockInput).then((value) => {
        expect(value).toEqual(mockOutput)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'put',
        url: baseUrl + '/items/1'
    })
    mockResponse.flush(mockOutput)
  })

  it('should delete an item', (done: DoneFn) => {
    sut.delete('items/1').then((value) => {
        expect(value).toBeNull()
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'delete',
        url: baseUrl + '/items/1'
    })
    mockResponse.flush(null)
  })
});

