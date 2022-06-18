import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class CRUDService<InputType, OutputType> {  
  constructor(
        protected _httpClient: HttpClient, protected _auth: AuthService) {}

  protected _toAbsoluteUrl(relativeUrl: string): string {
    return `${environment.baseUrl}/${relativeUrl}`
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
  
  async list(relativeUrl: string): Promise<OutputType[]> {
    const request$ = this._httpClient.get<OutputType[]>(
      this._toAbsoluteUrl(relativeUrl), this._httpOptions)
    return firstValueFrom(request$)
  }
  
  async create(relativeUrl: string, itemInput: InputType): Promise<OutputType> {
    const request$ = this._httpClient.post<OutputType>(
      this._toAbsoluteUrl(relativeUrl), itemInput, this._httpOptions)
    return firstValueFrom(request$)
  }
  
  async read(relativeUrl: string) : Promise<OutputType> {
    const request$ = this._httpClient.get<OutputType>(
      this._toAbsoluteUrl(relativeUrl), this._httpOptions)
    return firstValueFrom(request$)
  }
  
  async update(relativeUrl: string, itemInput: InputType) : Promise<OutputType> {
    const request$ = this._httpClient.put<OutputType>(
      this._toAbsoluteUrl(relativeUrl), itemInput, this._httpOptions)
    return firstValueFrom(request$)
  }
  
  async delete(relativeUrl: string): Promise<null> {
    const request$ = this._httpClient.delete<null>(
      this._toAbsoluteUrl(relativeUrl), this._httpOptions)
    return firstValueFrom(request$)
  }
}