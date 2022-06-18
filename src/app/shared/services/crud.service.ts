import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";

export abstract class CRUDService<InputType, OutputType> {
    protected _baseUrl: string = environment.baseUrl
  
    constructor(
          protected _httpClient: HttpClient, protected _auth: AuthService) {}

      protected abstract _getItemsUrl(pathArgs: object): string
      protected abstract _getItemUrl(pathArgs: object): string
  
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
  
      protected async _list(
          pathArgs: object = {}, 
          queryArgs: object = {}): Promise<OutputType[]> {
        const request$ = this._httpClient.get<OutputType[]>(
          this._getItemsUrl(pathArgs), this._httpOptions)
        return firstValueFrom(request$)
      }
  
      protected async _create(
          item: InputType, 
          pathArgs: object = {},
          queryArgs: object = {}): Promise<OutputType> {
        const request$ = this._httpClient.post<OutputType>(
          this._getItemsUrl(pathArgs), item, this._httpOptions)
        return firstValueFrom(request$)
      }
  
      protected async _read(
          pathArgs: object = {},
          queryArgs: object = {}) : Promise<OutputType> {
        const request$ = this._httpClient.get<OutputType>(
          this._getItemUrl(pathArgs), this._httpOptions)
        return firstValueFrom(request$)
      }
  
      protected async _update(
          item: InputType, 
          pathArgs: object = {},
          queryArgs: object = {}) : Promise<OutputType> {
        const request$ = this._httpClient.put<OutputType>(
          this._getItemUrl(pathArgs), item, this._httpOptions)
        return firstValueFrom(request$)
      }
  
      protected async _delete(
          pathArgs: object = {}, 
          queryArgs: object = {}): Promise<null> {
        const request$ = this._httpClient.delete<null>(
          this._getItemUrl(pathArgs), this._httpOptions)
        return firstValueFrom(request$)
      }
  }