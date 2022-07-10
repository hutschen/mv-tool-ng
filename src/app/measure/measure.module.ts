import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasureTableComponent } from './measure-table.component';
import { MeasureDialogComponent } from './measure-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { DocumentModule } from '../document/document.module';



@NgModule({
  declarations: [
    MeasureTableComponent,
    MeasureDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    DocumentModule,
  ],
  exports: [
    MeasureTableComponent,
  ],
})
export class MeasureModule { }
