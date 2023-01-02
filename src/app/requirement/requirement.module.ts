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
import { ComplianceDialogComponent } from './compliance-dialog.component';
import { RequirementDetailsComponent } from './requirement-details.component';
import { RequirementImportDialogComponent } from './requirement-import-dialog.component';
import { RequirementViewComponent } from './requirement-view.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ProjectIdGuard } from '../shared/guards/id.guard';
import { ProjectModule } from '../project/project.module';

const routes = [
  {
    path: 'projects/:projectId/requirements',
    canActivate: [AuthGuard, ProjectIdGuard],
    component: RequirementViewComponent,
  },
];

@NgModule({
  declarations: [
    RequirementTableComponent,
    RequirementDialogComponent,
    ComplianceDialogComponent,
    RequirementDetailsComponent,
    RequirementImportDialogComponent,
    RequirementViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ProjectModule,
    RouterModule.forChild(routes),
  ],
  exports: [RequirementDetailsComponent],
})
export class RequirementModule {}
