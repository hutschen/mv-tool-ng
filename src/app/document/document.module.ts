import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTableComponent } from './document-table.component';
import { DocumentDialogComponent } from './document-dialog.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { DocumentInputComponent } from './document-input.component';



@NgModule({
  declarations: [
    DocumentTableComponent,
    DocumentDialogComponent,
    DocumentInputComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule
  ],
  exports: [
    DocumentTableComponent,
  ],
})
export class DocumentModule { }
