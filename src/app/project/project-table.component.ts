import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITableColumn } from '../shared/components/table.component';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styles: ['.data-row:hover { cursor: pointer; background-color: #f5f5f5; }'],
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
    let dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(async (projectInput) => {
      if (projectInput) {
        await this._projectService.createProject(projectInput);
        this.onReloadProjects();
      }
    });
  }

  onEditProject(project: Project) {
    let dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project,
    });
    dialogRef.afterClosed().subscribe(async (projectInput) => {
      if (projectInput) {
        await this._projectService.updateProject(project.id, projectInput);
        this.onReloadProjects();
      }
    });
  }

  async onDeleteProject(project: Project) {
    await this._projectService.deleteProject(project.id);
    this.onReloadProjects();
  }

  async onReloadProjects() {
    this.data = await this._projectService.listProjects();
  }
}
