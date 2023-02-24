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
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { Catalog, CatalogService } from '../shared/services/catalog.service';
import { CatalogDialogService } from './catalog-dialog.component';
import { CatalogDataFrame } from '../shared/data/catalog/catalog-frame';
import { QueryParamsService } from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';

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
  @Output() clickCatalog = new EventEmitter<Catalog>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _catalogService: CatalogService,
    protected _catalogDialogService: CatalogDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  ngOnInit() {
    this.dataFrame = new CatalogDataFrame(
      this._catalogService,
      this._queryParamsService.getQueryParams()
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
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

  onHideColumns() {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
