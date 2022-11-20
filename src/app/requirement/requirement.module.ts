// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequirementTableComponent } from './requirement-table.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { RequirementDialogComponent } from './requirement-dialog.component';
import { TargetObjectInputComponent } from './target-object-input.component';
import { ComplianceDialogComponent } from './compliance-dialog.component';
import { RequirementDetailsComponent } from './requirement-details.component';
import { RequirementImportDialogComponent } from './requirement-import-dialog.component';

@NgModule({
  declarations: [
    RequirementTableComponent,
    RequirementDialogComponent,
    TargetObjectInputComponent,
    ComplianceDialogComponent,
    RequirementDetailsComponent,
    RequirementImportDialogComponent,
  ],
  imports: [CommonModule, SharedModule, MaterialModule],
  exports: [
    RequirementTableComponent,
    RequirementDialogComponent,
    TargetObjectInputComponent,
    RequirementDetailsComponent,
  ],
})
export class RequirementModule {}
