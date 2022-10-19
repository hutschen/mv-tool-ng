// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITableColumn } from '../shared/components/table.component';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styles: [],
})
export class ProjectTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'name', optional: false },
    { name: 'description', optional: true },
    { name: 'jira_project_id', optional: false },
    { name: 'completion', optional: true },
    { name: 'options', optional: false },
  ];
  data: Project[] = [];
  dataLoaded: boolean = false;
  @Output() projectClicked = new EventEmitter<Project>();

  constructor(
    protected _projectService: ProjectService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadProjects();
    this.dataLoaded = true;
  }

  onCreateProject() {
    const dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(async (project: Project | null) => {
      if (project) {
        this.onReloadProjects();
      }
    });
  }

  onEditProject(project: Project) {
    const dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project,
    });
    dialogRef.afterClosed().subscribe(async (project: Project | null) => {
      if (project) {
        this.onReloadProjects();
      }
    });
  }

  async onDeleteProject(project: Project) {
    await this._projectService.deleteProject(project.id);
    await this.onReloadProjects();
  }

  async onReloadProjects() {
    this.data = await this._projectService.listProjects();
  }
}
