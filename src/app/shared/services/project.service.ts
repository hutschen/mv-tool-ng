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

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  static projectUrl = `${environment.baseUrl}/projects`

  constructor(private _httpClient: HttpClient, private _auth: AuthService) {}

  private get _httpOptions(): object {
    const credentials = this._auth.credentials
    const credentials_str = `${credentials.username}:${credentials.password}`
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(credentials_str)
      })
    }
  }

  async listProjects(): Promise<IProject[]> {
    const projects$ = this._httpClient.get<IProject[]>(
      ProjectService.projectUrl, this._httpOptions)
    return firstValueFrom(projects$)
  }

  async createProject(project: IProjectInput) {
    const project$ = this._httpClient.post<IProject>(
      ProjectService.projectUrl, project, this._httpOptions)
    return firstValueFrom(project$)
  }
}
