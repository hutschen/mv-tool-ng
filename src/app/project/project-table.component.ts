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
  styles: [
    '.data-row:hover { cursor: pointer; background-color: #f5f5f5; }',
  ]
})
export class ProjectTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'jira_project_id', 'options'];
  dataSource: MatTableDataSource<Project> = new MatTableDataSource<Project>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @Output() projectClicked = new EventEmitter<Project>();

  constructor(
    protected _projectService: ProjectService, 
    protected _dialog: MatDialog) {}

  async ngOnInit() {
    this.onReloadProjects()
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onClickProject(project: Project) {
    this.projectClicked.emit(project);
  }

  onCreateProject() {
    let dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px'
    })
    dialogRef.afterClosed().subscribe(async projectInput => {
      if (projectInput) {
        await this._projectService.createProject(projectInput)
        this.onReloadProjects()
      }
    })
  }

  onEditProject(project: Project) {
    let dialogRef = this._dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project,
    })
    dialogRef.afterClosed().subscribe(async projectInput => {
      if (projectInput) {
        await this._projectService.updateProject(project.id, projectInput)
        this.onReloadProjects()
      }
    })
  }

  async onDeleteProject(project: Project) {
    await this._projectService.deleteProject(project.id)
    this.onReloadProjects()
  }

  onFilterProjects(event: Event) { 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async onReloadProjects() {
    this.dataSource.data = await this._projectService.listProjects()
  }
}
