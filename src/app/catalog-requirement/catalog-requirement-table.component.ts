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
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { CatalogModule } from '../shared/services/catalog-module.service';
import {
  CatalogRequirement,
  CatalogRequirementService,
} from '../shared/services/catalog-requirement.service';
import { CatalogRequirementDialogService } from './catalog-requirement-dialog.component';
import { QueryParamsService } from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogRequirementDataFrame } from '../shared/data/catalog-requirement/catalog-requirement-frame';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';

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
  @Input() catalogModule?: CatalogModule;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogRequirementService: CatalogRequirementService,
    protected _catalogRequirementDialogService: CatalogRequirementDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  ngOnInit() {
    if (!this.catalogModule) throw new Error('catalog module is undefined');
    this.dataFrame = new CatalogRequirementDataFrame(
      this._catalogRequirementService,
      this.catalogModule,
      this._queryParamsService.getQueryParams()
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
  }

  protected async _createOrEditCatalogRequirement(
    catalogRequirement?: CatalogRequirement
  ): Promise<void> {
    if (this.catalogModule) {
      const dialogRef =
        this._catalogRequirementDialogService.openCatalogRequirementDialog(
          this.catalogModule,
          catalogRequirement
        );
      const resultingCatalogRequirement = await firstValueFrom(
        dialogRef.afterClosed()
      );
      if (resultingCatalogRequirement) {
        this.dataFrame.addOrUpdateItem(resultingCatalogRequirement);
      }
    } else {
      throw new Error('catalog module is undefined');
    }
  }

  async onCreateCatalogRequirement(): Promise<void> {
    this._createOrEditCatalogRequirement();
  }

  async onEditCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Promise<void> {
    this._createOrEditCatalogRequirement(catalogRequirement);
  }

  async onDeleteCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Catalog Requirement',
      `Do you really want to delete the catalog requirement "${catalogRequirement.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._catalogRequirementService.deleteCatalogRequirement(
          catalogRequirement.id
        )
      );
      this.dataFrame.removeItem(catalogRequirement);
    }
  }

  async onExportCatalogRequirementsExcel(): Promise<void> {
    if (this.catalogModule) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._catalogRequirementService.downloadCatalogRequirementExcel({
          catalog_module_ids: this.catalogModule.id,
          // TODO: This is a quick solution to get the query params.
          // In future, query params should be cached to avoid running the pipe
          ...(await firstValueFrom(this.dataFrame.search.queryParams$)),
          ...(await firstValueFrom(this.dataFrame.columns.filterQueryParams$)),
          ...(await firstValueFrom(this.dataFrame.sort.queryParams$)),
        }),
        'catalog-requirements.xlsx'
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
