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
import { Catalog, CatalogService } from '../shared/services/catalog.service';
import { CatalogDataFrame } from '../shared/data/catalog/catalog-frame';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { CatalogInteractionService } from '../shared/services/catalog-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import { ImportDatasetDialogService } from '../shared/components/import-dataset-dialog.component';

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
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _importDatasetDialogService: ImportDatasetDialogService,
    readonly catalogInteractions: CatalogInteractionService
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

    // Sync interactions
    this.dataFrame.syncInteractions(this.catalogInteractions);

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

  async onExportCatalogsDataset(): Promise<void> {
    const dialogRef = this._exportDatasetDialogService.openExportDatasetDialog(
      'Catalogs',
      await firstValueFrom(this.exportQueryParams$),
      {
        downloadExcel: this._catalogService.downloadCatalogExcel.bind(
          this._catalogService
        ),
        downloadCsv: this._catalogService.downloadCatalogCsv.bind(
          this._catalogService
        ),
        getColumnNames: this._catalogService.getCatalogExcelColumnNames.bind(
          this._catalogService
        ),
      },
      'catalogs'
    );
    await firstValueFrom(dialogRef.afterClosed());
  }

  async onImportCatalogsDataset(): Promise<void> {
    const dialogRef = this._importDatasetDialogService.openImportDatasetDialog(
      'Catalogs',
      {
        uploadExcel: this._catalogService.uploadCatalogExcel.bind(
          this._catalogService
        ),
        uploadCsv: this._catalogService.uploadCatalogCsv.bind(
          this._catalogService
        ),
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
