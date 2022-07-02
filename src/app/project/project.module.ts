import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ProjectTableComponent } from './project-table.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectDialogComponent } from './project-dialog.component';
import { JiraProjectModule } from '../jira-project/jira-project.module';

@NgModule({
  declarations: [
    ProjectTableComponent,
    ProjectDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    JiraProjectModule,
  ],
  exports: [
    ProjectTableComponent
  ]
})
export class ProjectModule { }
