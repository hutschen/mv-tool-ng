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
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { CatalogModuleInteractionService } from '../shared/services/catalog-module-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { CatalogModuleBulkEditDialogService } from './catalog-module-bulk-edit-dialog.component';
import {
  BulkEditScope,
  toBulkEditScope,
  toBulkEditScopeText,
} from '../shared/bulk-edit-scope';
import { ImportDatasetDialogService } from '../shared/components/import-dataset-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';

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
  bulkEditScope$!: Observable<BulkEditScope>;
  @Input() catalog!: Catalog;
  @Output() clickCatalogModule = new EventEmitter<CatalogModule>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogModuleService: CatalogModuleService,
    protected _catalogModuleBulkEditDialogService: CatalogModuleBulkEditDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _importDatasetDialogService: ImportDatasetDialogService,
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
      this.marked.selection$.pipe(
        map((selection) =>
          selection.length > 0 ? { ids: selection } : ({} as IQueryParams)
        )
      ),
    ]);

    // Define bulk edit scope
    this.bulkEditScope$ = this.bulkEditQueryParams$.pipe(
      map((queryParams) => toBulkEditScope(queryParams))
    );
  }

  async onEditCatalogModules() {
    if (this.catalog) {
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      const dialogRef =
        this._catalogModuleBulkEditDialogService.openCatalogModuleBulkEditDialog(
          { catalog_ids: this.catalog.id, ...queryParams },
          await firstValueFrom(this.bulkEditScope$)
        );
      const catalogModules = await firstValueFrom(dialogRef.afterClosed());
      if (catalogModules) this.dataFrame.reload();
    } else {
      throw new Error('Catalog is undefined');
    }
  }

  async onDeleteCatalogModules() {
    if (this.catalog) {
      const scope = await firstValueFrom(this.bulkEditScope$);
      const dialogRef = this._confirmDialogService.openConfirmDialog(
        `Delete ${scope} catalog modules?`,
        `Are you sure you want to delete ${toBulkEditScopeText(
          scope
        )}  modules of this catalog?`
      );

      const confirm = await firstValueFrom(dialogRef.afterClosed());
      if (confirm) {
        await firstValueFrom(
          this._catalogModuleService.deleteCatalogModules({
            catalog_ids: this.catalog.id,
            ...(await firstValueFrom(this.bulkEditQueryParams$)),
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
            downloadExcel:
              this._catalogModuleService.downloadCatalogModuleExcel.bind(
                this._catalogModuleService
              ),
            downloadCsv:
              this._catalogModuleService.downloadCatalogModuleCsv.bind(
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

  async onImportCatalogModulesDataset(): Promise<void> {
    if (!this.catalog) throw new Error('catalog is undefined');

    const dialogRef = this._importDatasetDialogService.openImportDatasetDialog(
      'Catalog Modules',
      {
        uploadExcel: this._catalogModuleService.uploadCatalogModuleExcel.bind(
          this._catalogModuleService
        ),
        uploadCsv: this._catalogModuleService.uploadCatalogModuleCsv.bind(
          this._catalogModuleService
        ),
      },
      { fallback_catalog_id: this.catalog.id }
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
