import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './pipes';
import { HttpClientModule } from '@angular/common/http';
import { TableOptionsComponent } from './components/table-options.component';



@NgModule({
  declarations: [
    TruncatePipe,
    TableOptionsComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    HttpClientModule,
    TruncatePipe,
  ]
})
export class SharedModule { }
