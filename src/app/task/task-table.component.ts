import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TaskService, Task } from '../shared/services/task.service';
import { TaskDialogComponent } from './task-dialog.component';

@Component({
  selector: 'mvtool-task-table',
  templateUrl: './task-table.component.html',
  styles: [
  ]
})
export class TaskTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'summary', 'description', 'completed', 'options'];
  dataSource = new MatTableDataSource<Task>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @Input() measureId: number | null = null;
  @Output() taskClicked = new EventEmitter<Task>()

  constructor(
    protected _taskService: TaskService, 
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadTasks()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onTaskClicked(task: Task): void {
    this.taskClicked.emit(task)
  }

  onCreateTask(): void {
    let dialogRef = this._dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { measureId: this.measureId, task: null }
    })
    dialogRef.afterClosed().subscribe(async taskInput => {
      if (taskInput && this.measureId !== null) {
        await this._taskService.createTask(
          this.measureId, taskInput)
        this.onReloadTasks()
      }
    })
  }

  onEditTask(task: Task): void {
    let dialogRef = this._dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { measureId: this.measureId, task }
    })
    dialogRef.afterClosed().subscribe(async taskInput => {
      if (taskInput && this.measureId !== null) {
        await this._taskService.createTask(
          this.measureId, taskInput)
        this.onReloadTasks()
      }
    })
  }

  async onDeleteTask(task: Task): Promise<void> {
    await this._taskService.deleteTask(task.id)
    this.onReloadTasks()
  }

  onFilterTasks(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onExportTasks(): void {}
  onImportTasks(): void {}

  async onReloadTasks(): Promise<void> {
    if(this.measureId !== null) {
      this.dataSource.data = await this._taskService.listTasks(
        this.measureId)
    }
  }
}
