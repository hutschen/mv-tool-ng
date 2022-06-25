import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { ProjectTableComponent } from './project-table.component';



@NgModule({
  declarations: [
    ProjectTableComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ]
})
export class ProjectModule { }
