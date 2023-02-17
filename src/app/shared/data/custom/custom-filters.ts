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

import { map, Observable } from 'rxjs';
import { CatalogService } from '../../services/catalog.service';
import { IQueryParams } from '../../services/query-params.service';
import { FilterByValues, IFilterOption } from '../filter';

export class CatalogFilter extends FilterByValues {
  constructor(
    protected _catalogService: CatalogService,
    initQueryParams: IQueryParams = {}
  ) {
    super('catalog_ids', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request catalogs representations and convert them to filter options
    return this._catalogService.getCatalogRepresentations(queryParams).pipe(
      map((catalogReprs) => {
        if (!Array.isArray(catalogReprs)) catalogReprs = catalogReprs.items;
        return catalogReprs.map((cr) => ({
          value: cr.id,
          label: (cr.reference ? cr.reference + ' ' : '') + cr.title,
        }));
      })
    );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request catalogs representations
    const queryParams = new Object() as IQueryParams;
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    const queryParams = { catalog_ids: values };
    return this.__loadOptions(queryParams);
  }
}
