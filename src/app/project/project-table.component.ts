import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Project, ProjectService } from '../shared/services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styles: []
})
export class ProjectTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'jira_project_id', 'options'];
  dataSource: MatTableDataSource<Project> = new MatTableDataSource<Project>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  constructor(
    protected _projectService: ProjectService, 
    protected _dialog: MatDialog) {}

  async ngOnInit() {
    this.dataSource.data = await this._projectService.listProjects()
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onCreateProject() {
    let dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px'
    })
    dialogRef.afterClosed().subscribe(async projectInput => {
      if (projectInput) {
        await this._projectService.createProject(projectInput)
        this.dataSource.data = await this._projectService.listProjects()
      }
    })
  }

  onEditProject(project: Project): void {
    let dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project,
    })
    dialogRef.afterClosed().subscribe(async projectInput => {
      if (projectInput) {
        await this._projectService.updateProject(project.id, projectInput)
        this.dataSource.data = await this._projectService.listProjects()
      }
    })
  }

  async onDeleteProject(project: Project): Promise<void> {
    await this._projectService.deleteProject(project.id)
    this.dataSource.data = await this._projectService.listProjects()
  }

  onFilterProjects(event: Event) { 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
