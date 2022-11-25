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
import { MatDialog } from '@angular/material/dialog';
import { ITableColumn } from '../shared/components/table.component';
import { Catalog, CatalogService } from '../shared/services/catalog.service';
import { CatalogDialogComponent } from './catalog-dialog.component';

@Component({
  selector: 'mvtool-catalog-table',
  templateUrl: './catalog-table.component.html',
  styleUrls: ['../shared/styles/mat-table.css', '../shared/styles/flex.css'],
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

  constructor(
    protected _catalogService: CatalogService,
    protected _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.onReloadCatalogs();
  }

  protected _openCatalogDialog(catalog: Catalog | null = null): void {
    const dialogRef = this._dialog.open(CatalogDialogComponent, {
      width: '500px',
      data: catalog,
    });
    dialogRef.afterClosed().subscribe(async (catalog: Catalog | null) => {
      if (catalog) {
        this.onReloadCatalogs();
      }
    });
  }

  onCreateCatalog(): void {
    return this._openCatalogDialog();
  }

  onEditCatalog(catalog: Catalog): void {
    return this._openCatalogDialog(catalog);
  }

  onDeleteCatalog(catalog: Catalog): void {
    this._catalogService
      .deleteCatalog(catalog.id)
      .subscribe(this.onReloadCatalogs.bind(this));
  }

  onReloadCatalogs(): void {
    this._catalogService.listCatalogs().subscribe((catalogs) => {
      this.data = catalogs;
      this.dataLoaded = true;
    });
  }
}
