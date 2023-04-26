// Copyright (C) 2023 Helmar Hutschenreuter
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

import { CatalogModuleService } from '../../services/catalog-module.service';
import { Catalog } from '../../services/catalog.service';
import { IQueryParams } from '../../services/query-params.service';
import { FilterByValues } from '../filter';
import {
  CatalogModuleOptions,
  CatalogModuleReferenceOptions,
} from './catalog-module-options';

export class CatalogModuleReferencesFilter extends FilterByValues {
  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalog: Catalog,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      'references',
      new CatalogModuleReferenceOptions(_catalogModuleService, _catalog, true),
      initQueryParams,
      'string'
    );
  }
}

export class CatalogModulesFilter extends FilterByValues {
  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalog?: Catalog,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      'catalog_module_ids',
      new CatalogModuleOptions(_catalogModuleService, _catalog, true),
      initQueryParams,
      'number'
    );
  }
}
