import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequirementTableComponent } from './requirement-table.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    RequirementTableComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
  ],
  exports: [
    RequirementTableComponent,
  ]
})
export class RequirementModule { }
