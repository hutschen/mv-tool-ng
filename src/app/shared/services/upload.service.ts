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

  upload(relativeUrl: string, file: File): Observable<any> {
    const credentials = this._auth.credentials;
    const credentials_str = `${credentials.username}:${credentials.password}`;
    const initialState: IUploadState = {
      state: 'pending',
      progress: 0,
    };

    const formData = new FormData();
    formData.append('upload_file', file);
    return this._httpClient
      .post(this.toAbsoluteUrl(relativeUrl), formData, {
        headers: new HttpHeaders({
          Authorization: 'Basic ' + btoa(credentials_str),
        }),
        observe: 'events',
        reportProgress: true,
      })
      .pipe(scan(this._caculateState, initialState));
  }
}
