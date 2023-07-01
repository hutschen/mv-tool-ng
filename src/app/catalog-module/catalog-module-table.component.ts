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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogModuleDataFrame } from '../shared/data/catalog-module/catalog-module-frame';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { CatalogModuleInteractionService } from '../shared/services/catalog-module-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogService,
} from '../shared/components/confirm-dialog.component';
import { isEmpty } from 'radash';
import { MatDialogRef } from '@angular/material/dialog';
import { CatalogModuleBulkEditDialogService } from './catalog-module-bulk-edit-dialog.component';

@Component({
  selector: 'mvtool-catalog-module-table',
  templateUrl: './catalog-module-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class CatalogModuleTableComponent implements OnInit {
  dataFrame!: CatalogModuleDataFrame;
  marked!: DataSelection<CatalogModule>;
  expanded!: DataSelection<CatalogModule>;
  exportQueryParams$!: Observable<IQueryParams>;
  bulkEditQueryParams$!: Observable<IQueryParams>;
  bulkEditAll$!: Observable<boolean>;
  @Input() catalog!: Catalog;
  @Output() clickCatalogModule = new EventEmitter<CatalogModule>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogModuleService: CatalogModuleService,
    protected _catalogModuleBulkEditDialogService: CatalogModuleBulkEditDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    readonly catalogModuleInteractions: CatalogModuleInteractionService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.catalog) throw new Error('catalog is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new CatalogModuleDataFrame(
      this._catalogModuleService,
      this.catalog,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.catalogModuleInteractions);

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

  async onEditCatalogModules() {
    if (this.catalog) {
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      const dialogRef =
        this._catalogModuleBulkEditDialogService.openCatalogModuleBulkEditDialog(
          { catalog_ids: this.catalog.id, ...queryParams },
          !isEmpty(queryParams)
        );
      const catalogModules = await firstValueFrom(dialogRef.afterClosed());
      if (catalogModules) this.dataFrame.reload();
    } else {
      throw new Error('Catalog is undefined');
    }
  }

  async onDeleteCatalogModules() {
    if (this.catalog) {
      let dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>;
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      if (isEmpty(queryParams)) {
        dialogRef = this._confirmDialogService.openConfirmDialog(
          'Delete all catalog modules?',
          'Are you sure you want to delete all modules in this catalog?'
        );
      } else {
        dialogRef = this._confirmDialogService.openConfirmDialog(
          'Delete all filtered catalog modules?',
          'Are you sure you want to delete all catalog modules that match the current filter?'
        );
      }
      const confirm = await firstValueFrom(dialogRef.afterClosed());
      if (confirm) {
        await firstValueFrom(
          this._catalogModuleService.deleteCatalogModules({
            catalog_ids: this.catalog.id,
            ...queryParams,
          })
        );
        this.dataFrame.reload();
      }
    } else {
      throw new Error('Catalog is undefined');
    }
  }

  async onExportCatalogModulesDataset() {
    if (this.catalog) {
      const dialogRef =
        this._exportDatasetDialogService.openExportDatasetDialog(
          'Catalog Modules',
          {
            catalog_ids: this.catalog.id,
            ...(await firstValueFrom(this.exportQueryParams$)),
          },
          {
            downloadDataset:
              this._catalogModuleService.downloadCatalogModuleExcel.bind(
                this._catalogModuleService
              ),
            getColumnNames:
              this._catalogModuleService.getCatalogModuleExcelColumnNames.bind(
                this._catalogModuleService
              ),
          },
          'catalog_modules'
        );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Catalog is undefined');
    }
  }

  async onImportCatalogModulesExcel(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.catalog) {
          return this._catalogModuleService.uploadCatalogModuleExcel(file, {
            fallback_catalog_id: this.catalog.id,
          });
        } else {
          throw new Error('Catalog is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state === 'done') {
      this.dataFrame.reload();
    }
  }

  async onImportGSBaustein(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.catalog) {
          return this._catalogModuleService.uploadGSBaustein(
            this.catalog.id,
            file
          );
        } else {
          throw new Error('catalog is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state == 'done') {
      this.dataFrame.reload();
    }
  }

  onHideColumns() {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
