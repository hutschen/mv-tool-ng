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
  static projectsUrl = `${environment.baseUrl}/projects`

  constructor(private _httpClient: HttpClient, private _auth: AuthService) {}

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

  async listProjects(): Promise<IProject[]> {
    const request$ = this._httpClient.get<IProject[]>(
      ProjectService.projectsUrl, this._httpOptions)
    return firstValueFrom(request$)
  }

  async createProject(project: IProjectInput): Promise<IProject> {
    const request$ = this._httpClient.post<IProject>(
      ProjectService.projectsUrl, project, this._httpOptions)
    return firstValueFrom(request$)
  }

  protected _getProjectUrl(projectId: number): string {
    return `${ProjectService.projectsUrl}/${projectId}`
  }

  async getProject(projectId: number) : Promise<IProject> {
    const request$ = this._httpClient.get<IProject>(
      this._getProjectUrl(projectId), this._httpOptions)
    return firstValueFrom(request$)
  }

  async updateProject(
      projectId: number, project: IProjectInput) : Promise<IProject> {
    const request$ = this._httpClient.put<IProject>(
      this._getProjectUrl(projectId), project, this._httpOptions)
    return firstValueFrom(request$)
  }

  async deleteProject(projectId: number) {
    const request$ = this._httpClient.delete<null>(
      this._getProjectUrl(projectId), this._httpOptions)
    return firstValueFrom(request$)
  }
}
