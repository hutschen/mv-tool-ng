import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './pipes';
import { HttpClientModule } from '@angular/common/http';
import { TableOptionsComponent } from './components/table-options.component';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    TruncatePipe,
    TableOptionsComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  exports: [
    HttpClientModule,
    TruncatePipe,
    TableOptionsComponent,
  ]
})
export class SharedModule { }
