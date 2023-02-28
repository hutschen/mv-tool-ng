// Copyright (C) 2023 Helmar Hutschenreuter
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
import { ProjectMeasureViewComponent } from './project-measure-view.component';
import { ProjectMeasureTableComponent } from './project-measure-table.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ProjectIdGuard } from '../shared/guards/id.guard';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { ProjectModule } from '../project/project.module';
import { JiraIssueModule } from '../jira-issue/jira-issue.module';

const routes = [
  {
    path: 'projects/:projectId/measures',
    canActivate: [AuthGuard, ProjectIdGuard],
    component: ProjectMeasureViewComponent,
  },
];

@NgModule({
  declarations: [ProjectMeasureViewComponent, ProjectMeasureTableComponent],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ProjectModule,
    JiraIssueModule,
    RouterModule.forChild(routes),
  ],
})
export class ProjectMeasureModule {}
