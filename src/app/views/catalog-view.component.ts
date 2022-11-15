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

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Catalog } from '../shared/services/catalog.service';

@Component({
  selector: 'mvtool-catalog-view',
  template: `<mvtool-catalog-table
    (catalogClicked)="onCatalogClicked($event)"
  ></mvtool-catalog-table>`,
  styles: [],
})
export class CatalogViewComponent {
  constructor(protected _router: Router) {}

  onCatalogClicked(catalog: Catalog) {
    this._router.navigate(['/catalogs', catalog.id, 'catalog-modules']);
  }
}
