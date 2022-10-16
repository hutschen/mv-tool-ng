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

import { Injectable } from '@angular/core';
import { Catalog, ICatalog } from './catalog.service';

export interface ICatalogModuleInput {
  reference: string | null;
  title: string;
  description: string | null;
  gs_reference: string | null;
}

export interface ICatalogModule extends ICatalogModuleInput {
  id: number;
  catalog: ICatalog;
}

export class CatalogModule implements ICatalogModule {
  id: number;
  reference: string | null;
  title: string;
  description: string | null;
  gs_reference: string | null;
  catalog: Catalog;

  constructor(catalogModule: ICatalogModule) {
    this.id = catalogModule.id;
    this.reference = catalogModule.reference;
    this.title = catalogModule.title;
    this.description = catalogModule.description;
    this.gs_reference = catalogModule.gs_reference;
    this.catalog = new Catalog(catalogModule.catalog);
  }

  toCatalogModuleInput(): ICatalogModuleInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
      gs_reference: this.gs_reference,
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleService {
  constructor() {}
}
