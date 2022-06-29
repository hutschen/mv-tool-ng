import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProject, ProjectService } from '../shared/services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'jira_project_id', 'options'];
  dataSource: MatTableDataSource<IProject> = new MatTableDataSource<IProject>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  constructor(protected _projectService: ProjectService, protected _dialog: MatDialog) {}

  async uploadExcel(): Promise<void> {}
  async downloadExcel(): Promise<void> {}

  async createProject(): Promise<void> {
    await this._projectService.createProject({
      name: 'A test project',
      description: 'A test project description',
    });
    this.dataSource.data = await this._projectService.listProjects()
  }

  async deleteProject(project: IProject): Promise<void> {
    await this._projectService.deleteProject(project.id)
    this.dataSource.data = await this._projectService.listProjects()
  }

  editProject(project: IProject): void {
    let dialogRef = this._dialog.open(ProjectDialogComponent, {width: '500px'})
    dialogRef.afterClosed().subscribe(async projectInput => {
      if (projectInput) {
        await this._projectService.updateProject(project.id, projectInput)
        this.dataSource.data = await this._projectService.listProjects()
      }
    })
  }

  applyFilter(event: Event) { 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  async ngOnInit(): Promise<void> {
    this.dataSource.data = await this._projectService.listProjects()
  }

}
