import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './pipes';
import { HttpClientModule } from '@angular/common/http';
import { TableOptionsComponent } from './components/table-options.component';
import { MaterialModule } from '../material/material.module';
import { TableToolbarComponent } from './components/table-toolbar.component';
import { TableComponent } from './components/table.component';
import { DownloadDialogComponent } from './components/download-dialog.component';
import { UploadDialogComponent } from './components/upload-dialog.component';



@NgModule({
  declarations: [
    TruncatePipe,
    TableOptionsComponent,
    TableToolbarComponent,
    TableComponent,
    DownloadDialogComponent,
    UploadDialogComponent,
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
    TableComponent
  ]
})
export class SharedModule { }
