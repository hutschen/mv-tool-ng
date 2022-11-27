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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ITableColumn } from '../shared/components/table.component';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['../shared/styles/mat-table.css', '../shared/styles/flex.css'],
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
  protected _dataSubject = new ReplaySubject<Project[]>(1);
  data$: Observable<Project[]> = this._dataSubject.asObservable();
  dataLoaded: boolean = false;
  @Output() projectClicked = new EventEmitter<Project>();

  constructor(
    protected _projectService: ProjectService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadProjects();
  }

  protected _openProjectDialog(
    project: Project | null = null
  ): MatDialogRef<ProjectDialogComponent> {
    const dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project,
    });
    dialogRef.afterClosed().subscribe(async (project: Project | null) => {
      if (project) {
        this.onReloadProjects();
      }
    });
    return dialogRef;
  }

  onCreateProject(): MatDialogRef<ProjectDialogComponent> {
    return this._openProjectDialog();
  }

  onEditProject(project: Project): MatDialogRef<ProjectDialogComponent> {
    return this._openProjectDialog(project);
  }

  async onDeleteProject(project: Project): Promise<void> {
    await firstValueFrom(this._projectService.deleteProject(project.id));
    await this.onReloadProjects();
  }

  async onReloadProjects(): Promise<void> {
    const data = await firstValueFrom(this._projectService.listProjects());
    this._dataSubject.next(data);
    this.dataLoaded = true;
  }
}
