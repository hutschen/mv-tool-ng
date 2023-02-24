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
import { MeasureDialogComponent } from './measure-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { DocumentModule } from '../document/document.module';
import { JiraIssueModule } from '../jira-issue/jira-issue.module';
import { VerificationDialogComponent } from './verification-dialog.component';
import { MeasureViewComponent } from './measure-view.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { RequirementIdGuard } from '../shared/guards/id.guard';
import { RequirementModule } from '../requirement/requirement.module';
import { CompletionDialogComponent } from './completion-dialog.component';
import { MeasureTableComponent } from './measure-table.component';

const routes = [
  {
    path: 'requirements/:requirementId/measures',
    canActivate: [AuthGuard, RequirementIdGuard],
    component: MeasureViewComponent,
  },
];

@NgModule({
  declarations: [
    MeasureDialogComponent,
    VerificationDialogComponent,
    MeasureViewComponent,
    CompletionDialogComponent,
    MeasureTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    DocumentModule,
    JiraIssueModule,
    RequirementModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
})
export class MeasureModule {}
