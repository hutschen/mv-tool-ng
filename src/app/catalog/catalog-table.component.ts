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
import { ITableColumn } from '../shared/components/table.component';
import { Catalog, CatalogService } from '../shared/services/catalog.service';

@Component({
  selector: 'mvtool-catalog-table',
  templateUrl: './catalog-table.component.html',
  styles: [],
})
export class CatalogTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'reference', optional: true },
    { name: 'title', optional: false },
    { name: 'description', optional: true },
    { name: 'options', optional: false },
  ];
  data: Catalog[] = [];
  dataLoaded: boolean = false;
  @Output() catalogClicked = new EventEmitter<Catalog>();

  constructor(protected _catalogService: CatalogService) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadCatalogs();
    this.dataLoaded = true;
  }

  onCreateCatalog() {
    // TODO: implement
  }

  onEditCatalog(catalog: Catalog) {
    // TODO: implement
  }

  onDeleteCatalog(catalog: Catalog) {
    // TODO: implement
  }

  async onReloadCatalogs() {
    this.data = await this._catalogService.listCatalogs();
  }
}
