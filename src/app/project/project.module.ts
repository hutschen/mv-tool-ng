import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ProjectTableComponent } from './project-table.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

const routes = [
  { path: 'projects', component: ProjectTableComponent },
  { path: '**', redirectTo: 'projects' },
]

@NgModule({
  declarations: [
    ProjectTableComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ],
})
export class ProjectModule { }
