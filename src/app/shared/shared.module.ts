import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './pipes';
import { HttpClientModule } from '@angular/common/http';
import { TableOptionsComponent } from './components/table-options.component';
import { MaterialModule } from '../material/material.module';
import { TableToolbarComponent } from './components/table-toolbar.component';
import { TableComponent } from './components/table.component';



@NgModule({
  declarations: [
    TruncatePipe,
    TableOptionsComponent,
    TableToolbarComponent,
    TableComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  exports: [
    HttpClientModule,
    TruncatePipe,
    TableOptionsComponent,
    TableToolbarComponent,
  ]
})
export class SharedModule { }
