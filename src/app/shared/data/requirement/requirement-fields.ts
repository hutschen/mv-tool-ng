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

import { CatalogModule } from '../../services/catalog-module.service';
import { Catalog } from '../../services/catalog.service';
import { Requirement } from '../../services/requirement.service';
import { TextField } from '../custom/custom-fields';
import { DataField } from '../data';

export class CatalogField extends DataField<Requirement, Catalog | null> {
  constructor() {
    super('catalog');
  }

  override toValue(data: Requirement): Catalog | null {
    return data.catalog_requirement?.catalog_module.catalog ?? null;
  }

  override toStr(data: Requirement): string {
    const catalog = this.toValue(data);
    return catalog
      ? (catalog.reference ? catalog.reference + ' ' : '') + catalog.title
      : 'No catalog';
  }
}

export class CatalogModuleField extends DataField<
  Requirement,
  CatalogModule | null
> {
  constructor() {
    super('catalog_module');
  }

  override toValue(data: Requirement): CatalogModule | null {
    return data.catalog_requirement?.catalog_module ?? null;
  }

  override toStr(data: Requirement): string {
    const catalogModule = this.toValue(data);
    return catalogModule
      ? (catalogModule.reference ? catalogModule.reference + ' ' : '') +
          catalogModule.title
      : 'No catalog module';
  }
}

export class GSAbsicherungField extends TextField<Requirement> {
  constructor() {
    super('gs_absicherung', 'GS Absicherung');
  }

  override toValue(data: Requirement): string | null {
    return data.catalog_requirement?.gs_absicherung ?? null;
  }
}

export class GSVerantwortlicheField extends TextField<Requirement> {
  constructor() {
    super('gs_verantwortliche', 'GS Verantwortliche');
  }

  override toValue(data: Requirement): string | null {
    return data.catalog_requirement?.gs_verantwortliche ?? null;
  }
}

export class CompletionField extends DataField<Requirement, number | null> {
  constructor() {
    super('completion');
  }

  override toValue(data: Requirement): number | null {
    return data.percentComplete;
  }

  override toStr(data: Requirement): string {
    const completion = this.toValue(data);
    if (completion !== null) return `${completion}% complete`;
    else return 'Nothing to be completed';
  }

  override toBool(data: Requirement): boolean {
    return this.toValue(data) !== null;
  }
}

export class ComplianceAlertField extends DataField<
  Requirement,
  string | null
> {
  constructor() {
    super('alert');
  }

  override toValue(data: Requirement): string | null {
    if (
      data.compliance_status &&
      data.compliance_status !== data.compliance_status_hint
    ) {
      return `Compliance status should be ${data.compliance_status_hint}`;
    } else return null;
  }
}
