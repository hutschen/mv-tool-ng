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
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';
import { CatalogModuleDialogService } from './catalog-module-dialog.component';
import { QueryParamsService } from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogModuleDataFrame } from '../shared/data/catalog-module/catalog-module-frame';

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
  @Input() catalog?: Catalog;
  @Output() clickCatalogModule = new EventEmitter<CatalogModule>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogModuleService: CatalogModuleService,
    protected _catalogModuleDialogService: CatalogModuleDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.catalog) throw new Error('catalog is undefined');
    this.dataFrame = new CatalogModuleDataFrame(
      this._catalogModuleService,
      this.catalog,
      this._queryParamsService.getQueryParams()
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
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
