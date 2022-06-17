import { Component, OnInit } from '@angular/core';
import { IProject, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'jira_project_id']
  projects: IProject[] = []

  constructor(private _projectService: ProjectService) {}

  async ngOnInit(): Promise<void> {
    let createdProject = await this._projectService.create({
      name: 'A new project',
      description: 'A not so long description of the new project.',
      jira_project_id: null
    });
    await this._projectService.update(createdProject.id, {
      name: 'An updated project',
      description: 'An updated project description.',
      jira_project_id: null
    })
    this.projects = await this._projectService.list();
    console.log(await this._projectService.read(createdProject.id))
    await this._projectService.delete(createdProject.id)
  }

}
