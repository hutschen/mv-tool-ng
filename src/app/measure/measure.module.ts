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
import { MeasureTableComponent } from './measure-table.component';
import { MeasureDialogComponent } from './measure-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { DocumentModule } from '../document/document.module';
import { JiraIssueModule } from '../jira-issue/jira-issue.module';
import { VerificationDialogComponent } from './verification-dialog.component';

@NgModule({
  declarations: [
    MeasureTableComponent,
    MeasureDialogComponent,
    VerificationDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    DocumentModule,
    JiraIssueModule,
  ],
  exports: [MeasureTableComponent],
})
export class MeasureModule {}
