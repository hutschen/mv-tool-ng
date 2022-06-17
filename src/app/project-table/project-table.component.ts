import { Component, OnInit } from '@angular/core';
import { IProject, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit {
  public projects: IProject[] = [];

  constructor(private _projectService: ProjectService) {}

  async ngOnInit(): Promise<void> {
    let createdProject = await this._projectService.createProject({
      name: 'A new project',
      description: 'A not so long description of the new project.',
      jira_project_id: null
    });
    await this._projectService.updateProject(createdProject.id, {
      name: 'An updated project',
      description: 'An updated project description.',
      jira_project_id: null
    })
    this.projects = await this._projectService.listProjects();
    console.log(await this._projectService.getProject(createdProject.id))
    await this._projectService.deleteProject(createdProject.id)
  }

}
