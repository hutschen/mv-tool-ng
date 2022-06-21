import { TestBed } from '@angular/core/testing';
import { 
  HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { ProjectService } from './project.service';
import { DocumentService, IDocumentInput, IDocument } from './document.service';

describe('DocumentService', () => {
  let sut: DocumentService;
  let crud: CRUDService<IDocumentInput, IDocument>
  let projects: ProjectService 
  let httpMock: HttpTestingController
  let inputMock: IDocumentInput
  let outputMock: IDocument

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    sut = TestBed.inject(DocumentService);
    crud = TestBed.inject(CRUDService)
    projects = TestBed.inject(ProjectService)
    httpMock = TestBed.inject(HttpTestingController)
    inputMock = {
      title: 'A test document'
    }
    outputMock = {
      id: 1,
      title: inputMock.title,
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

  it('should return documents url', () => {
    expect(sut.getDocumentsUrl(outputMock.project.id)).toEqual(
      `${projects.getProjectUrl(outputMock.project.id)}/documents`)
  })

  it('should return document url', () => {
    expect(sut.getDocumentUrl(outputMock.id)).toEqual(
      `documents/${outputMock.id}`)
  })

  it('should list documents', (done: DoneFn) => {
    sut.listDocuments(outputMock.project.id).then((value) => {
      expect(value.length).toEqual(1)
      expect(value[0]).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getDocumentsUrl(outputMock.project.id))
    })
    mockResponse.flush([outputMock])
  })

  it('should create document', (done: DoneFn) => {
    sut.createDocument(outputMock.project.id, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: crud.toAbsoluteUrl(sut.getDocumentsUrl(outputMock.project.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should get document', (done: DoneFn) => {
    sut.getDocument(outputMock.id).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl(sut.getDocumentUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should update document', (done: DoneFn) => {
    sut.updateDocument(outputMock.id, inputMock).then((value) => {
      expect(value).toEqual(outputMock)
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: crud.toAbsoluteUrl(sut.getDocumentUrl(outputMock.id))
    })
    mockResponse.flush(outputMock)
  })

  it('should delete document', (done: DoneFn) => {
    sut.deleteDocument(outputMock.id).then((value) => {
      expect(value).toBeNull()
      done()
    })
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: crud.toAbsoluteUrl(sut.getDocumentUrl(outputMock.id))
    })
    mockResponse.flush(null)
  })
});
