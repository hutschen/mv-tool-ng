import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ProjectTableComponent } from './project-table.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ProjectTableComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
  ],
})
export class ProjectModule { }
