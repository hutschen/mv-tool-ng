import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController} from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { environment } from 'src/environments/environment';

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
  let inputMock: IItemInput
  let outputMock: IItemOutput

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
    });
    sut = TestBed.inject(CRUDService<IItemInput, IItemOutput>);
    httpMock = TestBed.inject(HttpTestingController);
    baseUrl = environment.baseUrl
    inputMock = {
        name: 'A test item'
    }
    outputMock = {
        id: 1,
        name: inputMock.name
    }
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should convert a relative to a absolute url', () => {
    const relativeUrl = 'this/is/a/test'
    expect(sut.toAbsoluteUrl(relativeUrl)).toEqual(`${baseUrl}/${relativeUrl}`)
  })

  it('should list items', (done: DoneFn) => {
    sut.list('items').then((value) => {
        expect(value.length).toEqual(1)
        expect(value[0]).toEqual(outputMock)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'get', 
        url: baseUrl + '/items'
    })
    mockResponse.flush([outputMock])
  });

  it('should create an item', (done: DoneFn) => {
    sut.create('items', inputMock).then((value) => {
        expect(value).toEqual(outputMock)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'post',
        url: baseUrl + '/items'
    })
    mockResponse.flush(outputMock)
  })

  it('should read an item', (done: DoneFn) => {
    sut.read('items/1').then((value) => {
        expect(value).toEqual(outputMock)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'get',
        url: baseUrl + '/items/1'
    })
    mockResponse.flush(outputMock)
  })

  it('should update an item', (done: DoneFn) => {
    sut.update('items/1', inputMock).then((value) => {
        expect(value).toEqual(outputMock)
        done()
    })
    const mockResponse = httpMock.expectOne({
        method: 'put',
        url: baseUrl + '/items/1'
    })
    mockResponse.flush(outputMock)
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

