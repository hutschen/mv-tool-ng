import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequirementTableComponent } from './requirement-table.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { RequirementDialogComponent } from './requirement-dialog.component';
import { TargetObjectInputComponent } from './target-object-input.component';
import { ComplianceDialogComponent } from './compliance-dialog.component';
import { RequirementCardComponent } from './requirement-card.component';

@NgModule({
  declarations: [
    RequirementTableComponent,
    RequirementDialogComponent,
    TargetObjectInputComponent,
    ComplianceDialogComponent,
    RequirementCardComponent,
  ],
  imports: [CommonModule, SharedModule, MaterialModule],
  exports: [
    RequirementTableComponent,
    RequirementDialogComponent,
    TargetObjectInputComponent,
    RequirementCardComponent,
  ],
})
export class RequirementModule {}
