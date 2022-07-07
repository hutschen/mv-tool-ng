import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasureTableComponent } from './measure-table.component';
import { MeasureDialogComponent } from './measure-dialog.component';



@NgModule({
  declarations: [
    MeasureTableComponent,
    MeasureDialogComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MeasureTableComponent,
  ],
})
export class MeasureModule { }
