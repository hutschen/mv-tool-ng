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
import { CatalogRequirementTableComponent } from './catalog-requirement-table.component';
import { CatalogRequirementDialogComponent } from './catalog-requirement-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { CatalogRequirementViewComponent } from './catalog-requirement-view.component';
import { CatalogModuleModule } from '../catalog-module/catalog-module.module';
import { CanActivateFn, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { CatalogModuleIdGuard } from '../shared/guards/id.guard';

const routes = [
  {
    path: 'catalog-modules/:catalogModuleId/catalog-requirements',
    canActivate: [
      () => inject(AuthGuard).canActivate(),
      (route) => inject(CatalogModuleIdGuard).canActivate(route),
    ] as CanActivateFn[],
    component: CatalogRequirementViewComponent,
  },
];

@NgModule({
  declarations: [
    CatalogRequirementTableComponent,
    CatalogRequirementDialogComponent,
    CatalogRequirementViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    CatalogModuleModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
})
export class CatalogRequirementModule {}
