import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasureTableComponent } from './measure-table.component';
import { MeasureDialogComponent } from './measure-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { DocumentModule } from '../document/document.module';
import { JiraIssueModule } from '../jira-issue/jira-issue.module';
import { MeasureCompleteButtonComponent } from './measure-complete-button.component';



@NgModule({
  declarations: [
    MeasureTableComponent,
    MeasureDialogComponent,
    MeasureCompleteButtonComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    DocumentModule,
    JiraIssueModule,
  ],
  exports: [
    MeasureTableComponent,
  ],
})
export class MeasureModule { }
