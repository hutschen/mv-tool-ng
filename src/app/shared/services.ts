import { Injectable } from "@angular/core";
import { IProject } from "./interfaces";

@Injectable({
    providedIn: "root"
})
export class ProjectService {
    getProjects(): IProject[] {
        return [
            {
                "description": "Some description of the test project.",
                "jira_project_id": null,
                "id": 1,
                "name": "A test project"
            },
            {
                "description": "Some description of the test project.",
                "jira_project_id": null,
                "id": 2,
                "name": "A test project"
            },
            {
                "description": "Some description of the test project.",
                "jira_project_id": null,
                "id": 3,
                "name": "A test project"
            },
            {
                "description": "Some description of the test project.",
                "jira_project_id": null,
                "id": 4,
                "name": "A test project"
            },
            {
                "description": "Some description of the test project.",
                "jira_project_id": null,
                "id": 5,
                "name": "A test project"
            }
        ]
    }
}