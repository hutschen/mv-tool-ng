import { Component, OnInit } from '@angular/core';
import { IProject } from '../shared/interfaces';
import { ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit {
  private _listFilter: string = '';
  public projects: IProject[] = [];

  constructor(private _projectService: ProjectService) {}

  get listFilter(): string {
    return this._listFilter
  }

  set listFilter(value: string) {
    this._listFilter = value
  }

  async ngOnInit(): Promise<void> {
    this.projects = await this._projectService.getProjects();
  }

}
