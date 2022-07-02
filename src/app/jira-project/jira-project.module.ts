import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JiraProjectLabelComponent } from './jira-project-label.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    JiraProjectLabelComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
  ],
  exports: [
    JiraProjectLabelComponent
  ]
})
export class JiraProjectModule { }
