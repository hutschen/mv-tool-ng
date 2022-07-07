import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITaskInput, Task } from '../shared/services/task.service';

export interface ITaskDialogData {
  measureId: number;
  task: Task | null
}

@Component({
  selector: 'mvtool-task-dialog',
  templateUrl: './task-dialog.component.html',
  styles: [
  ]
})
export class TaskDialogComponent {
  measureId: number;
  taskInput: ITaskInput = {
    summary: '',
    description: null,
    completed: false
  }

  constructor(
    protected _dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: ITaskDialogData) {
    this.measureId = this._dialogData.measureId;
    if (this._dialogData.task) {
      this.taskInput = this._dialogData.task.toTaskInput();
    }
  }

  get createMode(): boolean {
    return this._dialogData.task === null;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._dialogRef.close(this.taskInput);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
