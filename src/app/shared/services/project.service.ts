import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface IProjectInput {
  name: string;
  description: string | null;
  jira_project_id: string | null;
}

export interface IProject extends IProjectInput {
  id: number;
}

export abstract class CRUDService<InputType, OutputType> {
  protected _itemsUrl: string;

  constructor(
        protected _httpClient: HttpClient, protected _auth: AuthService,
        relativeBaseUrl: string) {
      this._itemsUrl = `${environment.baseUrl}/${relativeBaseUrl}`
    }

    protected _getItemUrl(itemId: number): string {
      return `${this._itemsUrl}/${itemId}`
    }

    protected get _httpOptions(): object {
      const credentials = this._auth.credentials
      const credentials_str = `${credentials.username}:${credentials.password}`
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(credentials_str)
        })
      }
    }

    async list(): Promise<OutputType[]> {
      const request$ = this._httpClient.get<OutputType[]>(
        this._itemsUrl, this._httpOptions)
      return firstValueFrom(request$)
    }

    async create(item: InputType): Promise<OutputType> {
      const request$ = this._httpClient.post<OutputType>(
        this._itemsUrl, item, this._httpOptions)
      return firstValueFrom(request$)
    }

    async get(itemId: number) : Promise<OutputType> {
      const request$ = this._httpClient.get<OutputType>(
        this._getItemUrl(itemId), this._httpOptions)
      return firstValueFrom(request$)
    }

    async update(
        itemIt: number, item: InputType) : Promise<OutputType> {
      const request$ = this._httpClient.put<OutputType>(
        this._getItemUrl(itemIt), item, this._httpOptions)
      return firstValueFrom(request$)
    }

    async delete(itemId: number) {
      const request$ = this._httpClient.delete<null>(
        this._getItemUrl(itemId), this._httpOptions)
      return firstValueFrom(request$)
    }
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends CRUDService<IProjectInput, IProject> {
  constructor(httpClient: HttpClient, auth: AuthService) {
    super(httpClient, auth, 'projects')
  }
}
