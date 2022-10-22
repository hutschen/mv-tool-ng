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
import { ITableColumn } from '../shared/components/table.component';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';

@Component({
  selector: 'mvtool-catalog-module-table',
  templateUrl: './catalog-module-table.component.html',
  styles: [],
})
export class CatalogModuleTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'reference', optional: true },
    { name: 'title', optional: false },
    { name: 'description', optional: true },
    { name: 'gs_reference', optional: true },
    { name: 'options', optional: false },
  ];
  data: CatalogModule[] = [];
  dataLoaded: boolean = false;
  @Input() catalog: Catalog | null = null;
  @Output() catalogModuleClicked = new EventEmitter<CatalogModule>();

  constructor(protected _catalogModuleService: CatalogModuleService) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadCatalogModules();
    this.dataLoaded = true;
  }

  onCreateCatalogModule() {
    throw new Error('Method not implemented.');
  }

  onDeleteCatalogModule(_t31: any) {
    throw new Error('Method not implemented.');
  }

  onEditCatalogModule(_t31: any) {
    throw new Error('Method not implemented.');
  }

  async onReloadCatalogModules(): Promise<void> {
    if (this.catalog) {
      this.data = await this._catalogModuleService.listCatalogModules(
        this.catalog.id
      );
    }
  }
}
