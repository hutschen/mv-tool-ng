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
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { ITableColumn } from '../shared/components/table.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';
import { CatalogModuleDialogService } from './catalog-module-dialog.component';

@Component({
  selector: 'mvtool-catalog-module-table',
  templateUrl: './catalog-module-table.component.html',
  styleUrls: ['../shared/styles/mat-table.css', '../shared/styles/flex.css'],
  styles: [],
})
export class CatalogModuleTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'reference', optional: true },
    { name: 'gs_reference', optional: true },
    { name: 'title', optional: false },
    { name: 'description', optional: true },
    { name: 'options', optional: false },
  ];
  protected _dataSubject = new ReplaySubject<CatalogModule[]>(1);
  data$: Observable<CatalogModule[]> = this._dataSubject.asObservable();
  data: CatalogModule[] = [];
  dataLoaded: boolean = false;
  @Input() catalog?: Catalog;
  @Output() catalogModuleClicked = new EventEmitter<CatalogModule>();

  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalogModuleDialogService: CatalogModuleDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadCatalogModules();
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
        await this.onReloadCatalogModules();
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
      await this.onReloadCatalogModules();
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
      await this.onReloadCatalogModules();
    }
  }

  async onReloadCatalogModules(): Promise<void> {
    if (this.catalog) {
      const data = await firstValueFrom(
        this._catalogModuleService.listCatalogModules(this.catalog.id)
      );
      this._dataSubject.next(data);
      this.dataLoaded = true;
    } else {
      throw new Error('catalog is undefined');
    }
  }
}
