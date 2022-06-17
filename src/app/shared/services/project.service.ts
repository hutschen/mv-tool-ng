import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IProject } from '../interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  static projectUrl = `${environment.baseUrl}/projects`

  constructor(private _httpClient: HttpClient, private _auth: AuthService) {}

  async listProjects(): Promise<IProject[]> {
    let credentials = this._auth.credentials
    let credentials_str = `${credentials.username}:${credentials.password}`
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(credentials_str)
      })
    }
    const projects$ = this._httpClient.get<IProject[]>(
      ProjectService.projectUrl, httpOptions)
    return firstValueFrom(projects$)
  }
}
