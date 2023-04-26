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
import { IOption, Options } from '../options';
import { CatalogService } from '../../services/catalog.service';
import { IQueryParams } from '../../services/query-params.service';

export class CatalogReferenceOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _catalogService: CatalogService,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request catalog references and convert them to options
    return this._catalogService.getCatalogReferences(queryParams).pipe(
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
    return this.__loadOptions({ references: references });
  }

  override filterOptions(
    filter?: string | null | undefined,
    limit?: number | undefined
  ): Observable<IOption[]> {
    // Build query params to request catalog references
    const queryParams: IQueryParams = {};
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}

export class CatalogOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _catalogService: CatalogService,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request catalog representations and convert them to options
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

  override getOptions(...catalogIds: number[]): Observable<IOption[]> {
    if (!catalogIds.length) return of([]);
    return this.__loadOptions({ ids: catalogIds });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request catalogs
    const queryParams: IQueryParams = {};
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}
