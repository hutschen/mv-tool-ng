export interface IProject {
    id: number;
    name: string;
    description: string | null;
    jira_project_id: string | null;
}