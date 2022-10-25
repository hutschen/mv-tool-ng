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
import {
  CatalogModule,
  CatalogModuleService,
  ICatalogModule,
} from './catalog-module.service';
import { CRUDService } from './crud.service';
import { IRequirementInput } from './requirement.service';

export interface ICatalogRequirementInput extends IRequirementInput {}

export interface ICatalogRequirement extends ICatalogRequirementInput {
  id: number;
  catalog_module: ICatalogModule;

  // Special attributes for IT Grundschutz Kompendium
  gs_anforderung_reference: string | null;
  gs_absicherung: string | null;
  gs_verantwortliche: string | null;
}

export class CatalogRequirement implements ICatalogRequirement {
  id: number;
  reference: string | null;
  summary: string;
  description: string | null;
  target_object: string | null;
  compliance_status: string | null;
  compliance_comment: string | null;
  catalog_module: CatalogModule;

  // Special attributes for IT Grundschutz Kompendium
  gs_anforderung_reference: string | null;
  gs_absicherung: string | null;
  gs_verantwortliche: string | null;

  constructor(catalogRequirement: ICatalogRequirement) {
    this.id = catalogRequirement.id;
    this.reference = catalogRequirement.reference;
    this.summary = catalogRequirement.summary;
    this.description = catalogRequirement.description;
    this.target_object = catalogRequirement.target_object;
    this.compliance_status = catalogRequirement.compliance_status;
    this.compliance_comment = catalogRequirement.compliance_comment;
    this.catalog_module = new CatalogModule(catalogRequirement.catalog_module);

    // Special attributes for IT Grundschutz Kompendium
    this.gs_anforderung_reference = catalogRequirement.gs_anforderung_reference;
    this.gs_absicherung = catalogRequirement.gs_absicherung;
    this.gs_verantwortliche = catalogRequirement.gs_verantwortliche;
  }

  toCatalogRequirementInput(): ICatalogRequirementInput {
    return {
      reference: this.reference,
      summary: this.summary,
      description: this.description,
      target_object: this.target_object,
      compliance_status: this.compliance_status,
      compliance_comment: this.compliance_comment,
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class CatalogRequirementService {
  constructor(
    protected _crud: CRUDService<ICatalogRequirementInput, ICatalogRequirement>,
    protected _catalogModules: CatalogModuleService
  ) {}

  getCatalogRequirementsUrl(catalogModuleId: number): string {
    return `${this._catalogModules.getCatalogModuleUrl(
      catalogModuleId
    )}/requirements`;
  }

  getCatalogRequirementUrl(requirementId: number): string {
    return `requirements/${requirementId}`;
  }

  async listCatalogRequirements(
    catalogModuleId: number
  ): Promise<CatalogRequirement[]> {
    const requirements = await this._crud.list(
      this.getCatalogRequirementsUrl(catalogModuleId)
    );
    return requirements.map((r) => new CatalogRequirement(r));
  }

  async createCatalogRequirement(
    catalogModuleId: number,
    catalogRequirementInput: ICatalogRequirementInput
  ): Promise<CatalogRequirement> {
    const catalogRequirement = await this._crud.create(
      this.getCatalogRequirementsUrl(catalogModuleId),
      catalogRequirementInput
    );
    return new CatalogRequirement(catalogRequirement);
  }

  async getCatalogRequirement(
    catalogRequirementId: number
  ): Promise<CatalogRequirement> {
    const catalogRequirement = await this._crud.read(
      this.getCatalogRequirementUrl(catalogRequirementId)
    );
    return new CatalogRequirement(catalogRequirement);
  }

  async updateCatalogRequirement(
    catalogRequirementId: number,
    catalogRequirementInput: ICatalogRequirementInput
  ): Promise<CatalogRequirement> {
    const catalogRequirement = await this._crud.update(
      this.getCatalogRequirementUrl(catalogRequirementId),
      catalogRequirementInput
    );
    return new CatalogRequirement(catalogRequirement);
  }

  async deleteCatalogRequirement(catalogRequirementId: number): Promise<null> {
    return this._crud.delete(
      this.getCatalogRequirementUrl(catalogRequirementId)
    );
  }
}
