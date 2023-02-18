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
import { Catalog, CatalogService } from '../../services/catalog.service';
import { IQueryParams } from '../../services/query-params.service';
import { DescriptionColumn, TitleColumn } from '../custom/custom-colums';
import { TextField } from '../custom/custom-fields';
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import { FilterByPattern, FilterForExistence, Filters } from '../filter';
import { CatalogReferencesFilter } from './catalog-filters';

export class CatalogDataFrame extends DataFrame<Catalog> {
  constructor(
    protected _catalogService: CatalogService,
    initQueryParams: IQueryParams = {}
  ) {
    // Reference column
    const referenceColumn = new DataColumn(
      new TextField('reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new CatalogReferencesFilter(_catalogService, initQueryParams),
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
    return this._catalogService.getCatalogFieldNames();
  }

  override getData(queryParams: IQueryParams) {
    return this._catalogService.queryCatalogs(queryParams).pipe(
      map((catalogs) => {
        if (Array.isArray(catalogs)) {
          this.length = catalogs.length;
          return catalogs;
        } else {
          this.length = catalogs.total_count;
          return catalogs.items;
        }
      })
    );
  }
}
