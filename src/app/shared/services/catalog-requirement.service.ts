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
import {
  CatalogModule,
  CatalogModuleService,
  ICatalogModule,
} from './catalog-module.service';
import { CRUDService, IPage } from './crud.service';
import { IQueryParams } from './query-params.service';
import { DownloadService } from './download.service';
import { UploadService } from './upload.service';
import { IAutoNumber } from '../components/auto-number-input.component';

export interface ICatalogRequirementInput {
  reference?: string | null;
  summary: string;
  description?: string | null;

  // Special attributes for IT Grundschutz Kompendium
  gs_absicherung?: string | null;
  gs_verantwortliche?: string | null;
}

export interface ICatalogRequirementPatch
  extends Omit<Partial<ICatalogRequirementInput>, 'reference'> {
  reference?: string | IAutoNumber | null;
}

export interface ICatalogRequirement extends ICatalogRequirementInput {
  id: number;
  catalog_module: ICatalogModule;
}

export class CatalogRequirement implements ICatalogRequirement {
  id: number;
  reference?: string | null;
  summary: string;
  description?: string | null;
  catalog_module: CatalogModule;

  // Special attributes for IT Grundschutz Kompendium
  gs_absicherung?: string | null;
  gs_verantwortliche?: string | null;

  constructor(catalogRequirement: ICatalogRequirement) {
    this.id = catalogRequirement.id;
    this.reference = catalogRequirement.reference;
    this.summary = catalogRequirement.summary;
    this.description = catalogRequirement.description;
    this.catalog_module = new CatalogModule(catalogRequirement.catalog_module);

    // Special attributes for IT Grundschutz Kompendium
    this.gs_absicherung = catalogRequirement.gs_absicherung;
    this.gs_verantwortliche = catalogRequirement.gs_verantwortliche;
  }

  toCatalogRequirementInput(): ICatalogRequirementInput {
    return {
      reference: this.reference,
      summary: this.summary,
      description: this.description,

      // Special attributes for IT Grundschutz Kompendium
      gs_absicherung: this.gs_absicherung,
      gs_verantwortliche: this.gs_verantwortliche,
    };
  }
}

export interface ICatalogRequirementRepresentation {
  id: number;
  reference?: string | null;
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogRequirementService {
  constructor(
    protected _crud_catalog_requirement: CRUDService<
      ICatalogRequirementInput,
      ICatalogRequirement,
      ICatalogRequirementPatch
    >,
    protected _crud_str: CRUDService<null, string>,
    protected _crud_repr: CRUDService<null, ICatalogRequirementRepresentation>,
    protected _download: DownloadService,
    protected _upload: UploadService,
    protected _catalogModules: CatalogModuleService
  ) {}

  getCatalogRequirementsUrl(catalogModuleId: number): string {
    return `${this._catalogModules.getCatalogModuleUrl(
      catalogModuleId
    )}/catalog-requirements`;
  }

  getCatalogRequirementUrl(catalogRequirementId: number): string {
    return `catalog-requirements/${catalogRequirementId}`;
  }

  queryCatalogRequirements(params: IQueryParams = {}) {
    return this._crud_catalog_requirement
      .query('catalog-requirements', params)
      .pipe(
        map((catalogRequirements) => {
          if (Array.isArray(catalogRequirements)) {
            return catalogRequirements.map((cr) => new CatalogRequirement(cr));
          } else {
            return {
              ...catalogRequirements,
              items: catalogRequirements.items.map(
                (cr) => new CatalogRequirement(cr)
              ),
            } as IPage<CatalogRequirement>;
          }
        })
      );
  }

  createCatalogRequirement(
    catalogModuleId: number,
    catalogRequirementInput: ICatalogRequirementInput
  ): Observable<CatalogRequirement> {
    return this._crud_catalog_requirement
      .create(
        this.getCatalogRequirementsUrl(catalogModuleId),
        catalogRequirementInput
      )
      .pipe(map((cr) => new CatalogRequirement(cr)));
  }

  getCatalogRequirement(
    catalogRequirementId: number
  ): Observable<CatalogRequirement> {
    return this._crud_catalog_requirement
      .read(this.getCatalogRequirementUrl(catalogRequirementId))
      .pipe(map((cr) => new CatalogRequirement(cr)));
  }

  updateCatalogRequirement(
    catalogRequirementId: number,
    catalogRequirementInput: ICatalogRequirementInput
  ): Observable<CatalogRequirement> {
    return this._crud_catalog_requirement
      .update(
        this.getCatalogRequirementUrl(catalogRequirementId),
        catalogRequirementInput
      )
      .pipe(map((cr) => new CatalogRequirement(cr)));
  }

  patchCatalogRequirements(
    catalogRequirementPatch: ICatalogRequirementPatch,
    params: IQueryParams = {}
  ): Observable<CatalogRequirement[]> {
    return this._crud_catalog_requirement
      .patchMany('catalog-requirements', catalogRequirementPatch, params)
      .pipe(map((crs) => crs.map((cr) => new CatalogRequirement(cr))));
  }

  deleteCatalogRequirement(catalogRequirementId: number): Observable<null> {
    return this._crud_catalog_requirement.delete(
      this.getCatalogRequirementUrl(catalogRequirementId)
    );
  }

  deleteCatalogRequirements(params: IQueryParams = {}): Observable<null> {
    return this._crud_catalog_requirement.delete(
      'catalog-requirements',
      params
    );
  }

  getCatalogRequirementFieldNames(params: IQueryParams = {}) {
    return this._crud_str.query(
      'catalog-requirement/field-names',
      params
    ) as Observable<string[]>;
  }

  getCatalogRequirementReferences(params: IQueryParams = {}) {
    return this._crud_str.query('catalog-requirement/references', params);
  }

  getCatalogRequirementRepresentations(params: IQueryParams = {}) {
    return this._crud_repr.query('catalog-requirement/representations', params);
  }

  downloadCatalogRequirementCsv(params: IQueryParams = {}) {
    return this._download.download('csv/catalog-requirements', params);
  }

  downloadCatalogRequirementExcel(params: IQueryParams = {}) {
    return this._download.download('excel/catalog-requirements', params);
  }

  getCatalogRequirementExcelColumnNames(): Observable<string[]> {
    return this._crud_str.query(
      'excel/catalog-requirements/column-names'
    ) as Observable<string[]>;
  }

  uploadCatalogRequirementExcel(file: File, params: IQueryParams = {}) {
    return this._upload.upload('excel/catalog-requirements', file, params);
  }
}
