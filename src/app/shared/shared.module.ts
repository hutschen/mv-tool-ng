import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './pipes';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    TruncatePipe,
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
