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
import { Observable, firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';
import { CatalogModuleDialogService } from './catalog-module-dialog.component';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogModuleDataFrame } from '../shared/data/catalog-module/catalog-module-frame';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';

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
  @Input() catalog?: Catalog;
  @Output() clickCatalogModule = new EventEmitter<CatalogModule>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogModuleService: CatalogModuleService,
    protected _catalogModuleDialogService: CatalogModuleDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
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
  }

  protected async _createOrEditCatalogModule(
    catalogModule?: CatalogModule
  ): Promise<void> {
    if (this.catalog) {
      const dialogRef =
        this._catalogModuleDialogService.openCatalogModuleDialog(
          this.catalog,
          catalogModule
        );
      const resultingCatalogModule = await firstValueFrom(
        dialogRef.afterClosed()
      );
      if (resultingCatalogModule) {
        this.dataFrame.addOrUpdateItem(resultingCatalogModule);
      }
    } else {
      throw new Error('catalog is undefined');
    }
  }

  async onCreateCatalogModule(): Promise<void> {
    await this._createOrEditCatalogModule();
  }

  async onEditCatalogModule(catalogModule: CatalogModule): Promise<void> {
    await this._createOrEditCatalogModule(catalogModule);
  }

  async onDeleteCatalogModule(catalogModule: CatalogModule): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Catalog Module',
      `Do you really want to delete the catalog module "${catalogModule.title}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._catalogModuleService.deleteCatalogModule(catalogModule.id)
      );
      this.dataFrame.removeItem(catalogModule);
    }
  }

  async onExportCatalogModulesExcel(): Promise<void> {
    if (this.catalog) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._catalogModuleService.downloadCatalogModuleExcel({
          catalog_ids: this.catalog.id,
          ...(await firstValueFrom(this.exportQueryParams$)),
        }),
        'catalog_modules.xlsx'
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
