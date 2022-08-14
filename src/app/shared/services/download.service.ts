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

export interface IDownload {
  state: 'pending' | 'in_progress' | 'done';
  progress: number;
  content: Blob | null;
}

function download(source: Observable<HttpEvent<Blob>>): Observable<IDownload> {
  return source.pipe(
    scan(
      (previousState: IDownload, event: HttpEvent<Blob>) => {
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
      },
      { state: 'pending', progress: 0, content: null }
    )
  );
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

  download(relativeUrl: string): Observable<IDownload> {
    const credentials = this._auth.credentials;
    const credentials_str = `${credentials.username}:${credentials.password}`;

    const request$ = this._httpClient.get(this.toAbsoluteUrl(relativeUrl), {
      headers: new HttpHeaders({
        Authorization: 'Basic ' + btoa(credentials_str),
      }),
      responseType: 'blob',
      observe: 'events',
      reportProgress: true,
    });
    return download(request$);
  }
}
