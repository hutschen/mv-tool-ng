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
    await this._projectService.createProject({
      name: 'A new project',
      description: 'A not so long description of the new project.',
      jira_project_id: null
    });
    this.projects = await this._projectService.listProjects();
  }

}
