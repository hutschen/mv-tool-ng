import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTableComponent } from './document-table.component';
import { DocumentDialogComponent } from './document-dialog.component';



@NgModule({
  declarations: [
    DocumentTableComponent,
    DocumentDialogComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DocumentTableComponent,
  ],
})
export class DocumentModule { }
