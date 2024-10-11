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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { IQueryParams } from './query-params.service';

export interface IPage<T> {
  items: T[];
  total_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CRUDService<
  InputType,
  OutputType,
  PatchType = Partial<InputType>
> {
  constructor(
    protected _httpClient: HttpClient,
    protected _auth: AuthService
  ) {}

  toAbsoluteUrl(relativeUrl: string): string {
    return `${environment.baseUrl}/${relativeUrl}`;
  }

  protected get _httpOptions(): object {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._auth.accessToken.access_token}`,
      }),
    };
  }

  query(
    relativeUrl: string,
    params: IQueryParams = {}
  ): Observable<OutputType[] | IPage<OutputType>> {
    return this._httpClient.get<OutputType[]>(this.toAbsoluteUrl(relativeUrl), {
      params,
      ...this._httpOptions,
    });
  }

  // TODO: Remove this method when it is not used anymore
  list_legacy(
    relativeUrl: string,
    params: IQueryParams = {}
  ): Observable<OutputType[]> {
    return this._httpClient.get<OutputType[]>(this.toAbsoluteUrl(relativeUrl), {
      params,
      ...this._httpOptions,
    });
  }

  create(relativeUrl: string, itemInput: InputType): Observable<OutputType> {
    return this._httpClient.post<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      itemInput,
      this._httpOptions
    );
  }

  read(relativeUrl: string): Observable<OutputType> {
    return this._httpClient.get<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      this._httpOptions
    );
  }

  update(relativeUrl: string, itemInput: InputType): Observable<OutputType> {
    return this._httpClient.put<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      itemInput,
      this._httpOptions
    );
  }

  patchMany(
    relativeUrl: string,
    itemPatch: PatchType,
    params: IQueryParams = {}
  ): Observable<OutputType[]> {
    return this._httpClient.patch<OutputType[]>(
      this.toAbsoluteUrl(relativeUrl),
      itemPatch,
      {
        params,
        ...this._httpOptions,
      }
    );
  }

  patch(relativeUrl: string, itemPatch: PatchType): Observable<OutputType> {
    return this._httpClient.patch<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      itemPatch,
      this._httpOptions
    );
  }

  delete(relativeUrl: string, params: IQueryParams = {}): Observable<null> {
    return this._httpClient.delete<null>(this.toAbsoluteUrl(relativeUrl), {
      params,
      ...this._httpOptions,
    });
  }

  import(
    relativeUrl: string,
    itemIds: number[],
    params: IQueryParams = {}
  ): Observable<OutputType[]> {
    return this._httpClient.post<OutputType[]>(
      this.toAbsoluteUrl(relativeUrl),
      itemIds,
      { params, ...this._httpOptions }
    );
  }
}
