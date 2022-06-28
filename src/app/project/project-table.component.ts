import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IProject, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'jira_project_id', 'options'];
  dataSource: MatTableDataSource<IProject> = new MatTableDataSource<IProject>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private _projectService: ProjectService) {}

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

  editProject(project: IProject): void {}

  applyFilter(event: Event) { 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  async ngOnInit(): Promise<void> {
    this.dataSource.data = await this._projectService.listProjects()
  }

}
