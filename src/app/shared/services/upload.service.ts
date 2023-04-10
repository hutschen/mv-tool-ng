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

import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, scan } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { IQueryParams } from './query-params.service';

export interface IUploadState {
  state: 'pending' | 'in_progress' | 'done';
  progress: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(
    protected _httpClient: HttpClient,
    protected _auth: AuthService
  ) {}

  // FIXME: this is a duplicate of the method in the CRUDService
  toAbsoluteUrl(relativeUrl: string): string {
    return `${environment.baseUrl}/${relativeUrl}`;
  }

  protected _caculateState(
    previousState: IUploadState,
    event: HttpEvent<unknown>
  ): IUploadState {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return {
          ...previousState,
          state: 'in_progress',
          progress: event.total
            ? Math.round((100 * event.loaded) / event.total)
            : previousState.progress,
        };
      case HttpEventType.Response:
        return {
          ...previousState,
          state: 'done',
        };
      default:
        return previousState;
    }
  }

  upload(
    relativeUrl: string,
    file: File,
    params: IQueryParams = {}
  ): Observable<IUploadState> {
    const initialState: IUploadState = {
      state: 'pending',
      progress: 0,
    };

    const formData = new FormData();
    formData.append('upload_file', file);
    return this._httpClient
      .post(this.toAbsoluteUrl(relativeUrl), formData, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this._auth.accessToken.access_token}`,
        }),
        observe: 'events',
        params: params,
        reportProgress: true,
      })
      .pipe(scan(this._caculateState, initialState));
  }
}
