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
import { TruncatePipe } from './pipes';
import { HttpClientModule } from '@angular/common/http';
import { TableRowOptionsComponent } from './components/table-row-options.component';
import { MaterialModule } from '../material/material.module';
import { TableToolbarComponent } from './components/table-toolbar.component';
import { LegacyTableComponent } from './components/legacy-table.component';
import { DownloadDialogComponent } from './components/download-dialog.component';
import { UploadDialogComponent } from './components/upload-dialog.component';
import { DetailComponent } from './components/detail.component';
import { ErrorDialogComponent } from './components/error-dialog.component';
import { CreateEditDialogComponent } from './components/create-edit-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { LegacyFilterDialogComponent } from './components/legacy-filter-dialog.component';
import { LegacyTableFilterHeaderComponent } from './components/legacy-table-filter-header.component';
import { AutocompleteComponent } from './components/autocomplete.component';
import { ShowHideDialogComponent } from './components/show-hide-dialog.component';
import { TableOptionsComponent } from './components/table-options.component';
import { ComplianceDialogComponent } from './components/compliance-dialog.component';
import { TableComponent } from './components/table.component';
import { FilterDialogComponent } from './components/filter-dialog.component';

@NgModule({
  declarations: [
    TruncatePipe,
    TableRowOptionsComponent,
    TableToolbarComponent,
    LegacyTableComponent,
    DownloadDialogComponent,
    UploadDialogComponent,
    DetailComponent,
    ErrorDialogComponent,
    CreateEditDialogComponent,
    ConfirmDialogComponent,
    LegacyFilterDialogComponent,
    LegacyTableFilterHeaderComponent,
    AutocompleteComponent,
    ShowHideDialogComponent,
    TableOptionsComponent,
    ComplianceDialogComponent,
    TableComponent,
    FilterDialogComponent,
  ],
  imports: [CommonModule, MaterialModule],
  exports: [
    HttpClientModule,
    TruncatePipe,
    TableOptionsComponent,
    TableRowOptionsComponent,
    TableToolbarComponent,
    LegacyTableComponent,
    DetailComponent,
    ErrorDialogComponent,
    CreateEditDialogComponent,
    LegacyTableFilterHeaderComponent,
    AutocompleteComponent,
    TableComponent,
  ],
})
export class SharedModule {}
