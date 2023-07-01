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

import { inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTableComponent } from './document-table.component';
import { DocumentDialogComponent } from './document-dialog.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { ProjectModule } from '../project/project.module';
import { CanActivateFn, RouterModule } from '@angular/router';
import { DocumentViewComponent } from './document-view.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ProjectIdGuard } from '../shared/guards/id.guard';
import { DocumentBulkEditDialogComponent } from './document-bulk-edit-dialog.component';

const routes = [
  {
    path: 'projects/:projectId/documents',
    canActivate: [
      (_, state) => inject(AuthGuard).canActivate(state),
      (route) => inject(ProjectIdGuard).canActivate(route),
    ] as CanActivateFn[],
    component: DocumentViewComponent,
  },
];

@NgModule({
  declarations: [
    DocumentTableComponent,
    DocumentDialogComponent,
    DocumentViewComponent,
    DocumentBulkEditDialogComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ProjectModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
})
export class DocumentModule {}
