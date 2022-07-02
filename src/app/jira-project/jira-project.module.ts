import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JiraProjectLabelComponent } from './jira-project-label.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { JiraProjectInputComponent } from './jira-project-input.component';



@NgModule({
  declarations: [
    JiraProjectLabelComponent,
    JiraProjectInputComponent
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
