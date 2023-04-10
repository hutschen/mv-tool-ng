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
import { CatalogTableComponent } from './catalog-table.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { CatalogDialogComponent } from './catalog-dialog.component';
import { CatalogDetailsComponent } from './catalog-details.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { CatalogViewComponent } from './catalog-view.component';

const routes = [
  {
    path: 'catalogs',
    canActivate: [() => inject(AuthGuard).canActivate()],
    component: CatalogViewComponent,
  },
];

@NgModule({
  declarations: [
    CatalogTableComponent,
    CatalogDialogComponent,
    CatalogDetailsComponent,
    CatalogViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ],
  exports: [CatalogDetailsComponent],
})
export class CatalogModule {}
