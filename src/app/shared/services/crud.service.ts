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
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CRUDService<InputType, OutputType> {
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

  list(relativeUrl: string): Observable<OutputType[]> {
    return this._httpClient.get<OutputType[]>(
      this.toAbsoluteUrl(relativeUrl),
      this._httpOptions
    );
  }

  async list_legacy(relativeUrl: string): Promise<OutputType[]> {
    return firstValueFrom(this.list(relativeUrl));
  }

  create(relativeUrl: string, itemInput: InputType): Observable<OutputType> {
    return this._httpClient.post<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      itemInput,
      this._httpOptions
    );
  }

  async create_legacy(
    relativeUrl: string,
    itemInput: InputType
  ): Promise<OutputType> {
    return firstValueFrom(this.create(relativeUrl, itemInput));
  }

  read(relativeUrl: string): Observable<OutputType> {
    return this._httpClient.get<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      this._httpOptions
    );
  }

  async read_legacy(relativeUrl: string): Promise<OutputType> {
    return firstValueFrom(this.read(relativeUrl));
  }

  update(relativeUrl: string, itemInput: InputType): Observable<OutputType> {
    return this._httpClient.put<OutputType>(
      this.toAbsoluteUrl(relativeUrl),
      itemInput,
      this._httpOptions
    );
  }

  async update_legacy(
    relativeUrl: string,
    itemInput: InputType
  ): Promise<OutputType> {
    return firstValueFrom(this.update(relativeUrl, itemInput));
  }

  delete(relativeUrl: string): Observable<null> {
    return this._httpClient.delete<null>(
      this.toAbsoluteUrl(relativeUrl),
      this._httpOptions
    );
  }

  async delete_legacy(relativeUrl: string): Promise<null> {
    return firstValueFrom(this.delete(relativeUrl));
  }

  import(relativeUrl: string, itemIds: number[]): Observable<OutputType[]> {
    return this._httpClient.post<OutputType[]>(
      this.toAbsoluteUrl(relativeUrl),
      itemIds,
      this._httpOptions
    );
  }

  async import_legacy(
    relativeUrl: string,
    itemIds: number[]
  ): Promise<OutputType[]> {
    return firstValueFrom(this.import(relativeUrl, itemIds));
  }
}
