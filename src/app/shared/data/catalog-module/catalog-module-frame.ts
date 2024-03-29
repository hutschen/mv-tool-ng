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

import { map } from 'rxjs';
import {
  CatalogModule,
  CatalogModuleService,
} from '../../services/catalog-module.service';
import { Catalog } from '../../services/catalog.service';
import { IQueryParams } from '../../services/query-params.service';
import { DescriptionColumn, TitleColumn } from '../custom/custom-colums';
import { TextField } from '../custom/custom-fields';
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import { FilterByPattern, FilterForExistence, Filters } from '../filter';
import { CatalogModuleReferencesFilter } from './catalog-module-filters';

export class CatalogModuleDataFrame extends DataFrame<CatalogModule> {
  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalog: Catalog,
    initQueryParams: IQueryParams = {}
  ) {
    const referenceColumn = new DataColumn(
      new TextField('reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new CatalogModuleReferencesFilter(
          _catalogModuleService,
          _catalog,
          initQueryParams
        ),
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    super(
      [
        referenceColumn,
        new TitleColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        new PlaceholderColumn('options'),
      ],
      initQueryParams
    );
    this.reload();
  }

  override getColumnNames() {
    return this._catalogModuleService.getCatalogModuleFieldNames({
      catalog_ids: this._catalog.id,
    });
  }

  override getData(queryParams: IQueryParams) {
    return this._catalogModuleService.queryCatalogModules({
      catalog_ids: this._catalog.id,
      ...queryParams,
    });
  }
}
