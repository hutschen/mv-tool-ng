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
import { CatalogModule } from '../../services/catalog-module.service';
import { CatalogRequirementService } from '../../services/catalog-requirement.service';
import { IQueryParams } from '../../services/query-params.service';
import { FilterByValues, IFilterOption } from '../filter';

export class CatalogRequirementReferencesFilter extends FilterByValues {
  constructor(
    protected _catalogRequirementService: CatalogRequirementService,
    protected _catalogModule: CatalogModule,
    initQueryParams: IQueryParams = {}
  ) {
    super('references', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request catalog requirement references and convert them to filter options
    return this._catalogRequirementService
      .getCatalogRequirementReferences(queryParams)
      .pipe(
        map((references) => {
          if (!Array.isArray(references)) references = references.items;
          return references.map((reference) => ({
            value: reference,
            label: reference,
          }));
        })
      );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request catalog requirement references
    const queryParams: IQueryParams = {
      catalog_module_ids: this._catalogModule.id,
    };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }
    return this.__loadOptions(queryParams);
  }

  override getOptionsByValues(values: string[]): Observable<IFilterOption[]> {
    const queryParams: IQueryParams = {
      catalog_module_ids: this._catalogModule.id,
      references: values,
    };
    return this.__loadOptions(queryParams);
  }
}
