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
import { CatalogModuleTableComponent } from './catalog-module-table.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { CatalogModuleDialogComponent } from './catalog-module-dialog.component';

@NgModule({
  declarations: [CatalogModuleTableComponent, CatalogModuleDialogComponent],
  imports: [CommonModule, SharedModule, MaterialModule],
  exports: [CatalogModuleTableComponent],
})
export class CatalogModuleModule {}
