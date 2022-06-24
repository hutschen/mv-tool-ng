import { Component, OnInit } from '@angular/core';
import { IProject, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'jira_project_id', 'options'];
  projects: IProject[] = []

  constructor(private _projectService: ProjectService) {}

  async createProject(): Promise<void> {
    await this._projectService.createProject({
      name: 'A test project',
      description: 'A test project description',
    });
    this.projects = await this._projectService.listProjects();
  }

  async deleteProject(project: IProject): Promise<void> {
    await this._projectService.deleteProject(project.id)
    this.projects = await this._projectService.listProjects();
  }

  editProject(project: IProject): void {}
  
  async ngOnInit(): Promise<void> {
    this.projects = await this._projectService.listProjects();
  }

}
