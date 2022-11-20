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
import { Observable } from 'rxjs';
import { Catalog, CatalogService, ICatalog } from './catalog.service';
import { CRUDService } from './crud.service';
import { IUploadState, UploadService } from './upload.service';

export interface ICatalogModuleInput {
  reference: string | null;
  title: string;
  description: string | null;
  gs_reference: string | null;
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
  gs_reference: string | null;
  catalog: Catalog;

  constructor(catalogModule: ICatalogModule) {
    this.id = catalogModule.id;
    this.reference = catalogModule.reference;
    this.title = catalogModule.title;
    this.description = catalogModule.description;
    this.gs_reference = catalogModule.gs_reference;
    this.catalog = new Catalog(catalogModule.catalog);
  }

  toCatalogModuleInput(): ICatalogModuleInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
      gs_reference: this.gs_reference,
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleService {
  constructor(
    protected _crud: CRUDService<ICatalogModuleInput, ICatalogModule>,
    protected _upload: UploadService,
    protected _catalogs: CatalogService
  ) {}

  getCatalogModulesUrl(catalogId: number): string {
    return `${this._catalogs.getCatalogsUrl()}/${catalogId}/catalog-modules`;
  }

  getCatalogModuleUrl(catalogModuleId: number): string {
    return `catalog-modules/${catalogModuleId}`;
  }

  async listCatalogModules(catalogId: number): Promise<CatalogModule[]> {
    const catalogModules = await this._crud.list_legacy(
      this.getCatalogModulesUrl(catalogId)
    );
    return catalogModules.map(
      (catalogModule) => new CatalogModule(catalogModule)
    );
  }

  async createCatalogModule(
    catalogId: number,
    catalogModuleInput: ICatalogModuleInput
  ): Promise<CatalogModule> {
    const catalogModule = await this._crud.create_legacy(
      this.getCatalogModulesUrl(catalogId),
      catalogModuleInput
    );
    return new CatalogModule(catalogModule);
  }

  async getCatalogModule(catalogModuleId: number): Promise<CatalogModule> {
    const catalogModule = await this._crud.read_legacy(
      this.getCatalogModuleUrl(catalogModuleId)
    );
    return new CatalogModule(catalogModule);
  }

  async updateCatalogModule(
    catalogModuleId: number,
    catalogModuleInput: ICatalogModuleInput
  ): Promise<CatalogModule> {
    const catalogModule = await this._crud.update_legacy(
      this.getCatalogModuleUrl(catalogModuleId),
      catalogModuleInput
    );
    return new CatalogModule(catalogModule);
  }

  async deleteCatalogModule(catalogModuleId: number): Promise<null> {
    return await this._crud.delete_legacy(
      this.getCatalogModuleUrl(catalogModuleId)
    );
  }

  uploadGSBaustein(catalogId: number, file: File): Observable<IUploadState> {
    const url = `${this.getCatalogModulesUrl(catalogId)}/gs-baustein`;
    return this._upload.upload(url, file);
  }
}
