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

export interface IDownloadState {
  state: 'pending' | 'in_progress' | 'done';
  progress: number;
  content: Blob | null;
}

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  constructor(
    protected _httpClient: HttpClient,
    protected _auth: AuthService
  ) {}

  // FIXME: this is a duplicate of the method in the CRUDService
  toAbsoluteUrl(relativeUrl: string): string {
    return `${environment.baseUrl}/${relativeUrl}`;
  }

  protected _caculateState(
    previousState: IDownloadState,
    event: HttpEvent<Blob>
  ): IDownloadState {
    switch (event.type) {
      case HttpEventType.DownloadProgress:
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
          content: event.body,
        };
      default:
        return previousState;
    }
  }

  download(relativeUrl: string): Observable<IDownloadState> {
    const credentials = this._auth.credentials;
    const credentials_str = `${credentials.username}:${credentials.password}`;
    const initialState: IDownloadState = {
      state: 'pending',
      progress: 0,
      content: null,
    };

    return this._httpClient
      .get(this.toAbsoluteUrl(relativeUrl), {
        headers: new HttpHeaders({
          Authorization: 'Basic ' + btoa(credentials_str),
        }),
        responseType: 'blob',
        observe: 'events',
        reportProgress: true,
      })
      .pipe(scan(this._caculateState, initialState));
  }
}
