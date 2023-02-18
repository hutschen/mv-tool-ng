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
import { map, Observable } from 'rxjs';
import { CRUDService, IPage } from './crud.service';
import { IQueryParams } from './query-params.service';

export interface ICatalogInput {
  reference: string | null;
  title: string;
  description: string | null;
}

export interface ICatalog extends ICatalogInput {
  id: number;
}

export class Catalog implements ICatalog {
  id: number;
  reference: string | null;
  title: string;
  description: string | null;

  constructor(catalog: ICatalog) {
    this.id = catalog.id;
    this.reference = catalog.reference;
    this.title = catalog.title;
    this.description = catalog.description;
  }

  toCatalogInput(): ICatalogInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
    };
  }
}

export interface ICatalogRepresentation {
  id: number;
  reference?: string | null;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor(
    protected _crud_catalog: CRUDService<ICatalogInput, ICatalog>,
    protected _crud_str: CRUDService<null, string>,
    protected _crud_repr: CRUDService<null, ICatalogRepresentation>
  ) {}

  getCatalogsUrl(): string {
    return 'catalogs';
  }

  getCatalogUrl(catalogId: number): string {
    return `${this.getCatalogsUrl()}/${catalogId}`;
  }

  queryCatalogs(params: IQueryParams = {}) {
    return this._crud_catalog.query('catalogs', params).pipe(
      map((catalogs) => {
        if (Array.isArray(catalogs)) {
          return catalogs.map((c) => new Catalog(c));
        } else {
          return {
            ...catalogs,
            items: catalogs.items.map((c) => new Catalog(c)),
          } as IPage<Catalog>;
        }
      })
    );
  }

  createCatalog(catalogInput: ICatalogInput): Observable<Catalog> {
    return this._crud_catalog
      .create(this.getCatalogsUrl(), catalogInput)
      .pipe(map((catalog) => new Catalog(catalog)));
  }

  getCatalog(catalogId: number): Observable<Catalog> {
    return this._crud_catalog
      .read(this.getCatalogUrl(catalogId))
      .pipe(map((catalog) => new Catalog(catalog)));
  }

  updateCatalog(
    catalogId: number,
    catalogInput: ICatalogInput
  ): Observable<Catalog> {
    return this._crud_catalog
      .update(this.getCatalogUrl(catalogId), catalogInput)
      .pipe(map((catalog) => new Catalog(catalog)));
  }

  deleteCatalog(catalogId: number): Observable<null> {
    return this._crud_catalog.delete(this.getCatalogUrl(catalogId));
  }

  getCatalogFieldNames(params: IQueryParams = {}) {
    return this._crud_str.query('catalog/field-names', params) as Observable<
      string[]
    >;
  }

  getCatalogReferences(params: IQueryParams = {}) {
    return this._crud_str.query('catalog/references', params);
  }

  getCatalogRepresentations(params: IQueryParams = {}) {
    return this._crud_repr.query('catalog/representations', params);
  }
}
