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

import { Component, Input, OnInit } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { CatalogModule } from '../shared/services/catalog-module.service';
import {
  CatalogRequirement,
  CatalogRequirementService,
} from '../shared/services/catalog-requirement.service';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogRequirementDataFrame } from '../shared/data/catalog-requirement/catalog-requirement-frame';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { CatalogRequirementInteractionService } from '../shared/services/catalog-requirement-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogService,
} from '../shared/components/confirm-dialog.component';
import { isEmpty } from 'radash';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mvtool-catalog-requirement-table',
  templateUrl: './catalog-requirement-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: ['.mat-column-gs_absicherung {text-align: center;}'],
})
export class CatalogRequirementTableComponent implements OnInit {
  dataFrame!: CatalogRequirementDataFrame;
  marked!: DataSelection<CatalogRequirement>;
  expanded!: DataSelection<CatalogRequirement>;
  exportQueryParams$!: Observable<IQueryParams>;
  bulkEditQueryParams$!: Observable<IQueryParams>;
  bulkEditAll$!: Observable<boolean>;
  @Input() catalogModule!: CatalogModule;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogRequirementService: CatalogRequirementService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    readonly catalogRequirementInteractions: CatalogRequirementInteractionService
  ) {}

  ngOnInit() {
    if (!this.catalogModule) throw new Error('catalog module is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new CatalogRequirementDataFrame(
      this._catalogRequirementService,
      this.catalogModule,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions with data frame
    this.dataFrame.syncInteractions(this.catalogRequirementInteractions);

    // Sync query params with query params service
    const syncQueryParams$ = combineQueryParams([
      this.dataFrame.queryParams$,
      this.marked.queryParams$,
      this.expanded.queryParams$,
    ]);
    this._queryParamsService.syncQueryParams(syncQueryParams$).subscribe();

    // Define export query params
    this.exportQueryParams$ = combineQueryParams([
      this.dataFrame.search.queryParams$,
      this.dataFrame.columns.filterQueryParams$,
      this.dataFrame.sort.queryParams$,
    ]);

    // Define bulk edit query params
    this.bulkEditQueryParams$ = combineQueryParams([
      this.dataFrame.search.queryParams$,
      this.dataFrame.columns.filterQueryParams$,
    ]);

    // Define bulk edit all flag
    this.bulkEditAll$ = this.bulkEditQueryParams$.pipe(
      map((queryParams) => isEmpty(queryParams))
    );
  }

  async onDeleteCatalogRequirements() {
    if (this.catalogModule) {
      let dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>;
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      if (isEmpty(queryParams)) {
        dialogRef = this._confirmDialogService.openConfirmDialog(
          'Delete all catalog requirements?',
          'Are you sure you want to delete all requirements related to this catalog module?'
        );
      } else {
        dialogRef = this._confirmDialogService.openConfirmDialog(
          'Delete filtered catalog requirements?',
          'Are you sure you want to delete all catalog requirement that match the current filter?'
        );
      }
      const confirmed = await firstValueFrom(dialogRef.afterClosed());
      if (confirmed) {
        await firstValueFrom(
          this._catalogRequirementService.deleteCatalogRequirements({
            catalog_module_ids: this.catalogModule.id,
            ...queryParams,
          })
        );
        this.dataFrame.reload();
      }
    } else {
      throw new Error('Catalog module is undefined');
    }
  }

  async onExportCatalogRequirementsDataset() {
    if (this.catalogModule) {
      const dialogRef =
        this._exportDatasetDialogService.openExportDatasetDialog(
          'Catalog Requirements',
          {
            catalog_module_ids: this.catalogModule.id,
            ...(await firstValueFrom(this.exportQueryParams$)),
          },
          {
            downloadDataset:
              this._catalogRequirementService.downloadCatalogRequirementExcel.bind(
                this._catalogRequirementService
              ),
            getColumnNames:
              this._catalogRequirementService.getCatalogRequirementExcelColumnNames.bind(
                this._catalogRequirementService
              ),
          },
          'catalog-requirements'
        );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Catalog module is undefined');
    }
  }

  async onImportCatalogRequirementsExcel(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.catalogModule) {
          return this._catalogRequirementService.uploadCatalogRequirementExcel(
            file,
            { fallback_catalog_module_id: this.catalogModule.id }
          );
        } else {
          throw new Error('Catalog module is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state === 'done') {
      this.dataFrame.reload();
    }
  }

  onHideColumns() {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
