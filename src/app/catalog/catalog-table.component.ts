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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { Catalog, CatalogService } from '../shared/services/catalog.service';
import { CatalogDialogService } from './catalog-dialog.component';
import { CatalogDataFrame } from '../shared/data/catalog/catalog-frame';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';

@Component({
  selector: 'mvtool-catalog-table',
  templateUrl: './catalog-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class CatalogTableComponent implements OnInit {
  dataFrame!: CatalogDataFrame;
  marked!: DataSelection<Catalog>;
  expanded!: DataSelection<Catalog>;
  exportQueryParams$!: Observable<IQueryParams>;
  @Output() clickCatalog = new EventEmitter<Catalog>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogService: CatalogService,
    protected _catalogDialogService: CatalogDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  ngOnInit() {
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new CatalogDataFrame(
      this._catalogService,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync query params
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

  protected async _createOrEditCatalog(catalog?: Catalog): Promise<void> {
    const dialogRef = this._catalogDialogService.openCatalogDialog(catalog);
    const resultingCatalog = await firstValueFrom(dialogRef.afterClosed());
    if (resultingCatalog) {
      this.dataFrame.addOrUpdateItem(resultingCatalog);
    }
  }

  async onCreateCatalog(): Promise<void> {
    await this._createOrEditCatalog();
  }

  async onEditCatalog(catalog: Catalog): Promise<void> {
    await this._createOrEditCatalog(catalog);
  }

  async onDeleteCatalog(catalog: Catalog): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Catalog',
      `Do you really want to delete the catalog "${catalog.title}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._catalogService.deleteCatalog(catalog.id));
      this.dataFrame.removeItem(catalog);
    }
  }

  async onExportCatalogs(): Promise<void> {
    const dialogRef = this._downloadDialogService.openDownloadDialog(
      this._catalogService.downloadCatalogExcel({
        ...(await firstValueFrom(this.exportQueryParams$)),
      }),
      'catalogs.xlsx'
    );
    await firstValueFrom(dialogRef.afterClosed());
  }

  async onImportCatalogs(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        return this._catalogService.uploadCatalogExcel(file);
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
