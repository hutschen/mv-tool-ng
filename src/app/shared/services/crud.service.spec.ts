// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

interface IItemInput {
  name: string;
}

interface IItemOutput extends IItemInput {
  id: number;
}

describe('CRUDService', () => {
  let sut: CRUDService<IItemInput, IItemOutput>;
  let httpMock: HttpTestingController;
  let baseUrl: string;
  let inputMock: IItemInput;
  let outputMock: IItemOutput;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    sut = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthService);
    auth.logIn({ username: 'test', password: 'test' });
    baseUrl = environment.baseUrl;
    inputMock = {
      name: 'A test item',
    };
    outputMock = {
      id: 1,
      name: inputMock.name,
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should convert a relative to a absolute url', () => {
    const relativeUrl = 'this/is/a/test';
    expect(sut.toAbsoluteUrl(relativeUrl)).toEqual(`${baseUrl}/${relativeUrl}`);
  });

  it('should list items', (done: DoneFn) => {
    sut.list('items').then((value) => {
      expect(value.length).toEqual(1);
      expect(value[0]).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: baseUrl + '/items',
    });
    mockResponse.flush([outputMock]);
  });

  it('should create an item', (done: DoneFn) => {
    sut.create('items', inputMock).then((value) => {
      expect(value).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'post',
      url: baseUrl + '/items',
    });
    mockResponse.flush(outputMock);
  });

  it('should read an item', (done: DoneFn) => {
    sut.read('items/1').then((value) => {
      expect(value).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: baseUrl + '/items/1',
    });
    mockResponse.flush(outputMock);
  });

  it('should update an item', (done: DoneFn) => {
    sut.update('items/1', inputMock).then((value) => {
      expect(value).toEqual(outputMock);
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'put',
      url: baseUrl + '/items/1',
    });
    mockResponse.flush(outputMock);
  });

  it('should delete an item', (done: DoneFn) => {
    sut.delete('items/1').then((value) => {
      expect(value).toBeNull();
      done();
    });
    const mockResponse = httpMock.expectOne({
      method: 'delete',
      url: baseUrl + '/items/1',
    });
    mockResponse.flush(null);
  });
});
