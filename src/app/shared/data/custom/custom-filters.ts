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
import { CatalogModuleService } from '../../services/catalog-module.service';
import { Catalog, CatalogService } from '../../services/catalog.service';
import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import { TargetObjectService } from '../../services/target-object.service';
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

export class CatalogModuleFilter extends FilterByValues {
  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalog?: Catalog,
    initQueryParams: IQueryParams = {}
  ) {
    super('catalog_module_ids', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request catalog modules representations and convert them to filter options
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

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request catalog modules representations
    const queryParams = new Object() as IQueryParams;
    if (this._catalog) queryParams['catalog_ids'] = this._catalog.id;
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
    const queryParams: IQueryParams = {
      catalog_module_ids: values,
    };
    if (this._catalog) queryParams['catalog_ids'] = this._catalog.id;
    return this.__loadOptions(queryParams);
  }
}

export class TargetObjectFilter extends FilterByValues {
  constructor(
    protected _targetObjectService: TargetObjectService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('target_objects', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request target objects and convert them to filter options
    return this._targetObjectService.getTargetObjects(queryParams).pipe(
      map((targetObjects) => {
        if (!Array.isArray(targetObjects)) targetObjects = targetObjects.items;
        return targetObjects.map((targetObject) => ({
          value: targetObject,
          label: targetObject,
        }));
      })
    );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request target objects
    const queryParams: IQueryParams = { project_ids: this._project.id };
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
    const queryParams: IQueryParams = {
      target_objects: values,
      project_ids: this._project.id,
    };
    return this.__loadOptions(queryParams);
  }
}
