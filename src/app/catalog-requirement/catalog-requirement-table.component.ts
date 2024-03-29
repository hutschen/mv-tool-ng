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
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { CatalogRequirementInteractionService } from '../shared/services/catalog-requirement-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { CatalogRequirementBulkEditDialogService } from './catalog-requirement-bulk-edit-dialog.component';
import {
  BulkEditScope,
  toBulkEditScope,
  toBulkEditScopeText,
} from '../shared/bulk-edit-scope';
import { ImportDatasetDialogService } from '../shared/components/import-dataset-dialog.component';

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
  bulkEditScope$!: Observable<BulkEditScope>;
  @Input() catalogModule!: CatalogModule;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogRequirementService: CatalogRequirementService,
    protected _catalogRequirementBulkEditDialogService: CatalogRequirementBulkEditDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _importDatasetDialogService: ImportDatasetDialogService,
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

  async onEditCatalogRequirements() {
    if (this.catalogModule) {
      const queryParams = await firstValueFrom(this.bulkEditQueryParams$);
      const dialogRef =
        this._catalogRequirementBulkEditDialogService.openCatalogRequirementBulkEditDialog(
          { catalog_module_ids: this.catalogModule.id, ...queryParams },
          await firstValueFrom(this.bulkEditScope$)
        );
      const catalogRequirements = await firstValueFrom(dialogRef.afterClosed());
      if (catalogRequirements) this.dataFrame.reload();
    } else {
      throw new Error('Catalog module is undefined');
    }
  }

  async onDeleteCatalogRequirements() {
    if (this.catalogModule) {
      const scope = await firstValueFrom(this.bulkEditScope$);
      const dialogRef = this._confirmDialogService.openConfirmDialog(
        `Delete ${scope} catalog requirements?`,
        `Are you sure you want to delete ${toBulkEditScopeText(
          scope
        )} requirements of this catalog module?`
      );

      const confirmed = await firstValueFrom(dialogRef.afterClosed());
      if (confirmed) {
        await firstValueFrom(
          this._catalogRequirementService.deleteCatalogRequirements({
            catalog_module_ids: this.catalogModule.id,
            ...(await firstValueFrom(this.bulkEditQueryParams$)),
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
            downloadExcel:
              this._catalogRequirementService.downloadCatalogRequirementExcel.bind(
                this._catalogRequirementService
              ),
            downloadCsv:
              this._catalogRequirementService.downloadCatalogRequirementCsv.bind(
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

  async onImportCatalogRequirementsDataset(): Promise<void> {
    const dialogRef = this._importDatasetDialogService.openImportDatasetDialog(
      'Catalog Requirements',
      {
        uploadExcel:
          this._catalogRequirementService.uploadCatalogRequirementExcel.bind(
            this._catalogRequirementService
          ),
        uploadCsv:
          this._catalogRequirementService.uploadCatalogRequirementCsv.bind(
            this._catalogRequirementService
          ),
      },
      { fallback_catalog_module_id: this.catalogModule.id }
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
