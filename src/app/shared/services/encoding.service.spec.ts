// Copyright (C) 2023 Helmar Hutschenreuter
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
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CRUDService } from './crud.service';
import { EncodingService, IEncoding } from './encoding.service';
import { AuthService } from './auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('EncodingService', () => {
  let sut: EncodingService;
  let crud: CRUDService<null, IEncoding>;
  let httpMock: HttpTestingController;
  let encodingMock: IEncoding;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    TestBed.inject(AuthService).setAccessToken({
      access_token: 'token',
      token_type: 'bearer',
    });
    crud = TestBed.inject(CRUDService);
    httpMock = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(EncodingService);

    encodingMock = {
      name: 'UTF-8',
      encoding: 'utf-8',
      description: 'UTF-8 Encoding',
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should list encodings', (done: DoneFn) => {
    const encodingList = [encodingMock];

    sut.listEncodings().subscribe({
      next: (value) => expect(value).toEqual(encodingList),
      complete: done,
    });

    const mockResponse = httpMock.expectOne({
      method: 'get',
      url: crud.toAbsoluteUrl('common/encodings'),
    });
    mockResponse.flush(encodingList);
  });
});
