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
import { Catalog, CatalogService, ICatalog } from './catalog.service';
import { CRUDService, IPage } from './crud.service';
import { IQueryParams } from './query-params.service';
import { UploadService } from './upload.service';
import { DownloadService } from './download.service';
import { IAutoNumber } from '../components/auto-number-input.component';

export interface ICatalogModuleInput {
  reference: string | null;
  title: string;
  description: string | null;
}

export interface ICatalogModulePatch
  extends Omit<Partial<ICatalogModuleInput>, 'reference'> {
  reference?: string | IAutoNumber | null;
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
  catalog: Catalog;

  constructor(catalogModule: ICatalogModule) {
    this.id = catalogModule.id;
    this.reference = catalogModule.reference;
    this.title = catalogModule.title;
    this.description = catalogModule.description;
    this.catalog = new Catalog(catalogModule.catalog);
  }

  toCatalogModuleInput(): ICatalogModuleInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
    };
  }
}

export interface ICatalogModuleRepresentation {
  id: number;
  reference?: string | null;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleService {
  constructor(
    protected _crud_catalog_module: CRUDService<
      ICatalogModuleInput,
      ICatalogModule,
      ICatalogModulePatch
    >,
    protected _crud_str: CRUDService<null, string>,
    protected _crud_repr: CRUDService<null, ICatalogModuleRepresentation>,
    protected _download: DownloadService,
    protected _upload: UploadService,
    protected _catalogs: CatalogService
  ) {}

  getCatalogModulesUrl(catalogId: number): string {
    return `${this._catalogs.getCatalogsUrl()}/${catalogId}/catalog-modules`;
  }

  getCatalogModuleUrl(catalogModuleId: number): string {
    return `catalog-modules/${catalogModuleId}`;
  }

  queryCatalogModules(params: IQueryParams) {
    return this._crud_catalog_module.query('catalog-modules', params).pipe(
      map((catalogModules) => {
        if (Array.isArray(catalogModules)) {
          return catalogModules.map((cm) => new CatalogModule(cm));
        } else {
          return {
            ...catalogModules,
            items: catalogModules.items.map((cm) => new CatalogModule(cm)),
          } as IPage<CatalogModule>;
        }
      })
    );
  }

  createCatalogModule(
    catalogId: number,
    catalogModuleInput: ICatalogModuleInput
  ): Observable<CatalogModule> {
    return this._crud_catalog_module
      .create(this.getCatalogModulesUrl(catalogId), catalogModuleInput)
      .pipe(map((catalogModule) => new CatalogModule(catalogModule)));
  }

  getCatalogModule(catalogModuleId: number): Observable<CatalogModule> {
    return this._crud_catalog_module
      .read(this.getCatalogModuleUrl(catalogModuleId))
      .pipe(map((catalogModule) => new CatalogModule(catalogModule)));
  }

  updateCatalogModule(
    catalogModuleId: number,
    catalogModuleInput: ICatalogModuleInput
  ): Observable<CatalogModule> {
    return this._crud_catalog_module
      .update(this.getCatalogModuleUrl(catalogModuleId), catalogModuleInput)
      .pipe(map((catalogModule) => new CatalogModule(catalogModule)));
  }

  patchCatalogModules(
    catalogModulePatch: ICatalogModulePatch,
    params: IQueryParams = {}
  ): Observable<CatalogModule[]> {
    return this._crud_catalog_module
      .patchMany('catalog-modules', catalogModulePatch, params)
      .pipe(map((cms) => cms.map((cm) => new CatalogModule(cm))));
  }

  deleteCatalogModule(catalogModuleId: number): Observable<null> {
    return this._crud_catalog_module.delete(
      this.getCatalogModuleUrl(catalogModuleId)
    );
  }

  deleteCatalogModules(params: IQueryParams): Observable<null> {
    return this._crud_catalog_module.delete('catalog-modules', params);
  }

  getCatalogModuleFieldNames(params: IQueryParams) {
    return this._crud_str.query(
      'catalog-module/field-names',
      params
    ) as Observable<string[]>;
  }

  getCatalogModuleReferences(params: IQueryParams) {
    return this._crud_str.query('catalog-module/references', params);
  }

  getCatalogModuleRepresentations(params: IQueryParams) {
    return this._crud_repr.query('catalog-module/representations', params);
  }

  downloadCatalogModuleCsv(params: IQueryParams) {
    return this._download.download('csv/catalog-modules', params);
  }

  downloadCatalogModuleExcel(params: IQueryParams) {
    return this._download.download('excel/catalog-modules', params);
  }

  getCatalogModuleExcelColumnNames(): Observable<string[]> {
    return this._crud_str.query(
      'excel/catalog-modules/column-names' //
    ) as Observable<string[]>;
  }

  uploadCatalogModuleCsv(file: File, params: IQueryParams) {
    return this._upload.upload('csv/catalog-modules', file, params);
  }

  uploadCatalogModuleExcel(file: File, params: IQueryParams) {
    return this._upload.upload('excel/catalog-modules', file, params);
  }

  uploadGSBaustein(catalogId: number, file: File) {
    const url = `${this.getCatalogModulesUrl(catalogId)}/gs-baustein`;
    return this._upload.upload(url, file);
  }
}
