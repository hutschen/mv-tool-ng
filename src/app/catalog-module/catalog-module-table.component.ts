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
import { MatDialog } from '@angular/material/dialog';
import { ITableColumn } from '../shared/components/table.component';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';
import {
  CatalogModuleDialogComponent,
  ICatalogModuleDialogData,
} from './catalog-module-dialog.component';

@Component({
  selector: 'mvtool-catalog-module-table',
  templateUrl: './catalog-module-table.component.html',
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
  data: CatalogModule[] = [];
  dataLoaded: boolean = false;
  @Input() catalog: Catalog | null = null;
  @Output() catalogModuleClicked = new EventEmitter<CatalogModule>();

  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadCatalogModules();
    this.dataLoaded = true;
  }

  protected _openCatalogModuleDialog(
    catalogModule: CatalogModule | null
  ): void {
    const dialogRef = this._dialog.open(CatalogModuleDialogComponent, {
      width: '500px',
      data: {
        catalog: this.catalog,
        catalogModule: catalogModule,
      } as ICatalogModuleDialogData,
    });
    dialogRef
      .afterClosed()
      .subscribe(async (catalogModule: CatalogModule | null) => {
        if (catalogModule) {
          await this.onReloadCatalogModules();
        }
      });
  }

  onCreateCatalogModule(): void {
    this._openCatalogModuleDialog(null);
  }

  onEditCatalogModule(catalogModule: CatalogModule): void {
    this._openCatalogModuleDialog(catalogModule);
  }

  async onDeleteCatalogModule(catalogModule: CatalogModule): Promise<void> {
    await this._catalogModuleService.deleteCatalogModule(catalogModule.id);
    await this.onReloadCatalogModules();
  }

  async onReloadCatalogModules(): Promise<void> {
    if (this.catalog) {
      this.data = await this._catalogModuleService.listCatalogModules(
        this.catalog.id
      );
    }
  }
}
