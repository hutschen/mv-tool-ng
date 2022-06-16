import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { IProject } from "./interfaces";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    private _username: string | null = null
    private _password: string | null = null

    public logIn(username: string, password: string) {
        this._username = username
        this._password = password
    }

    public logOut() {
        this._username = null
        this._password = null
    }

    public getHttpHeader(): void {
        // raise Http403Error, if user is not logged in
    }
}

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