import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { IProject } from "./interfaces";

@Injectable({
    providedIn: "root"
})
export class ProjectService {
    private _projectsUrl = "assets/api/projects.json"
    constructor(private _httpClient: HttpClient) {}

    async getProjects(): Promise<IProject[]> {
        const projects$ = this._httpClient.get<IProject[]>(this._projectsUrl)
        return firstValueFrom(projects$)
    }
}