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

import { Observable, map, of } from 'rxjs';
import { IOption, OptionValue, Options } from '../options';
import { CatalogModuleService } from '../../services/catalog-module.service';
import { Catalog } from '../../services/catalog.service';
import { IQueryParams } from '../../services/query-params.service';

export class CatalogModuleReferenceOptions extends Options {
  override readonly hasToLoad: boolean = true;

  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalog: Catalog,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request catalog module references and convert them to options
    return this._catalogModuleService
      .getCatalogModuleReferences(queryParams)
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

  override getOptions(...references: string[]): Observable<IOption[]> {
    if (!references.length) return of([]);
    return this.__loadOptions({
      catalog_ids: this._catalog.id,
      references: references,
    });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request catalog module references
    const queryParams: IQueryParams = {
      catalog: this._catalog.id,
    };
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}

export class CatalogModuleOptions extends Options {
  override readonly hasToLoad: boolean = true;

  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalog?: Catalog,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request catalog modules representations and convert them to options
    return this._catalogModuleService
      .getCatalogModuleRepresentations(queryParams)
      .pipe(
        map((catalogModuleReprs) => {
          if (!Array.isArray(catalogModuleReprs))
            catalogModuleReprs = catalogModuleReprs.items;
          return catalogModuleReprs.map((cmr) => ({
            value: cmr.id,
            label: (cmr.reference ? cmr.reference + ' ' : '') + cmr.title,
          }));
        })
      );
  }

  override getOptions(...ids: number[]): Observable<IOption[]> {
    if (!ids.length) return of([]);

    // Build query params to request catalog modules representations
    const queryParams: IQueryParams = { ids: ids };
    if (this._catalog) queryParams['catalog'] = this._catalog.id;

    return this.__loadOptions(queryParams);
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request catalog modules representations
    const queryParams: IQueryParams = {};
    if (this._catalog) queryParams['catalog'] = this._catalog.id;
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}
