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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogModule } from '../shared/services/catalog-module.service';
import { Catalog, CatalogService } from '../shared/services/catalog.service';

@Component({
  selector: 'mvtool-catalog-module-view',
  template: `
    <div *ngIf="catalog" class="fx-column">
      <mvtool-catalog-details [catalog]="catalog"></mvtool-catalog-details>
      <mat-divider></mat-divider>
      <mvtool-catalog-module-table
        [catalog]="catalog"
        (clickCatalogModule)="onCatalogModuleClicked($event)"
      ></mvtool-catalog-module-table>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [],
})
export class CatalogModuleViewComponent implements OnInit {
  catalog: Catalog | null = null;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    const catalogId = Number(this._route.snapshot.paramMap.get('catalogId'));
    this._catalogService.getCatalog(catalogId).subscribe({
      next: (catalog) => {
        this.catalog = catalog;
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this._router.navigate(['/']);
        } else {
          throw error;
        }
      },
    });
  }

  onCatalogModuleClicked(catalogModule: CatalogModule): void {
    this._router.navigate([
      '/catalog-modules',
      catalogModule.id,
      'catalog-requirements',
    ]);
  }
}
