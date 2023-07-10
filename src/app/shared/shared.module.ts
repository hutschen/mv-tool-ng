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
import { DownloadDialogComponent } from './components/download-dialog.component';
import { UploadDialogComponent } from './components/upload-dialog.component';
import { DetailComponent } from './components/detail.component';
import { ErrorDialogComponent } from './components/error-dialog.component';
import { CreateEditDialogComponent } from './components/create-edit-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { AutocompleteComponent } from './components/autocomplete.component';
import { ComplianceDialogComponent } from './components/compliance-dialog.component';
import { TableComponent } from './components/table.component';
import { FilterDialogComponent } from './components/filter-dialog.component';
import { FilterHeaderComponent } from './components/filter-header.component';
import { FilterByPatternComponent } from './components/filter-by-pattern.component';
import { FilterByValuesComponent } from './components/filter-by-values.component';
import { FilterForExistenceComponent } from './components/filter-for-existence.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TableOptionsComponent } from './components/table-options.component';
import { HideColumnsDialogComponent } from './components/hide-columns-dialog.component';
import { OptionsInputComponent } from './components/options-input.component';
import { CompletionStatusComponent } from './components/completion-status.component';
import { ComplianceStatusComponent } from './components/compliance-status.component';
import { VerificationMethodComponent } from './components/verification-method.component';
import { VerificationStatusComponent } from './components/verification-status.component';
import { ExportDatasetDialogComponent } from './components/export-dataset-dialog.component';
import { SelectionListComponent } from './components/selection-list.component';
import { DownloadComponent } from './components/download.component';
import { ComplianceInputComponent } from './components/compliance-input.component';
import { CompletionInputComponent } from './components/completion-input.component';
import { VerificationInputComponent } from './components/verification-input.component';
import { LoadingOverlayComponent } from './components/loading-overlay.component';

@NgModule({
  declarations: [
    TruncatePipe,
    TableRowOptionsComponent,
    TableToolbarComponent,
    DownloadDialogComponent,
    UploadDialogComponent,
    DetailComponent,
    ErrorDialogComponent,
    CreateEditDialogComponent,
    ConfirmDialogComponent,
    AutocompleteComponent,
    ComplianceDialogComponent,
    TableComponent,
    FilterDialogComponent,
    FilterHeaderComponent,
    FilterByPatternComponent,
    FilterByValuesComponent,
    FilterForExistenceComponent,
    TableOptionsComponent,
    HideColumnsDialogComponent,
    OptionsInputComponent,
    CompletionStatusComponent,
    ComplianceStatusComponent,
    VerificationMethodComponent,
    VerificationStatusComponent,
    ExportDatasetDialogComponent,
    SelectionListComponent,
    DownloadComponent,
    ComplianceInputComponent,
    CompletionInputComponent,
    VerificationInputComponent,
    LoadingOverlayComponent,
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  exports: [
    HttpClientModule,
    TruncatePipe,
    TableOptionsComponent,
    TableRowOptionsComponent,
    TableToolbarComponent,
    DetailComponent,
    ErrorDialogComponent,
    CreateEditDialogComponent,
    AutocompleteComponent,
    TableComponent,
    FilterHeaderComponent,
    HideColumnsDialogComponent,
    OptionsInputComponent,
    CompletionStatusComponent,
    ComplianceStatusComponent,
    VerificationMethodComponent,
    VerificationStatusComponent,
    ExportDatasetDialogComponent,
    SelectionListComponent,
    DownloadComponent,
    ComplianceInputComponent,
    CompletionInputComponent,
    VerificationInputComponent,
    LoadingOverlayComponent,
  ],
})
export class SharedModule {}
