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
import { MaterialModule } from '../material/material.module';
import { ProjectTableComponent } from './project-table.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectDialogComponent } from './project-dialog.component';
import { JiraProjectModule } from '../jira-project/jira-project.module';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectsViewComponent } from './projects-view.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

const routes = [
  {
    path: 'projects',
    canActivate: [AuthGuard],
    component: ProjectsViewComponent,
  },
];

@NgModule({
  declarations: [
    ProjectTableComponent,
    ProjectDialogComponent,
    ProjectDetailsComponent,
    ProjectsViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    JiraProjectModule,
    RouterModule.forChild(routes),
  ],
  exports: [ProjectDetailsComponent],
})
export class ProjectModule {}
