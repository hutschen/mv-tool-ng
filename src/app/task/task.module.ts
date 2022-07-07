import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskTableComponent } from './task-table.component';
import { TaskDialogComponent } from './task-dialog.component';



@NgModule({
  declarations: [
    TaskTableComponent,
    TaskDialogComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TaskModule { }
