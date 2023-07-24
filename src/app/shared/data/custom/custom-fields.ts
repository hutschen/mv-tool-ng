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
import { Document } from '../../services/document.service';
import { Project } from '../../services/project.service';
import { Requirement } from '../../services/requirement.service';
import { DataField, IDataItem } from '../data';

export class TextField<D extends IDataItem> extends DataField<
  D,
  string | null
> {}

export class StatusField<D extends IDataItem> extends DataField<
  D,
  string | null
> {
  override toStr(data: D): string {
    const status = this.toValue(data);
    return status ? status : 'Not set';
  }
}

export class CompletionField extends DataField<
  Requirement | Project | Document,
  number | null
> {
  constructor(optional: boolean = true) {
    super('completion_progress', 'Completion', optional);
  }

  override toValue(data: Requirement | Project | Document): number | null {
    // Calculation completion percentage
    return data.completion_count
      ? Math.round((data.completed_count / data.completion_count) * 100)
      : null;
  }

  override toStr(data: Requirement | Project | Document): string {
    const percent = this.toValue(data);
    if (percent !== null)
      return `${data.completed_count}/${data.completion_count} completed, ${percent}% complete`;
    else return 'Nothing to be completed';
  }

  override toBool(data: Requirement | Project | Document): boolean {
    return this.toValue(data) !== null;
  }
}

export class VerificationField extends DataField<
  Requirement | Project | Document,
  number | null
> {
  constructor(optional: boolean = true) {
    super('verification_progress', 'Verification', optional);
  }

  override toValue(data: Requirement | Project | Document): number | null {
    // Calculation verification percentage
    return data.verification_count
      ? Math.round((data.verified_count / data.verification_count) * 100)
      : null;
  }

  override toStr(data: Requirement | Project | Document): string {
    const percent = this.toValue(data);
    if (percent !== null)
      return `${data.verified_count}/${data.verification_count} verified, ${percent}% verified`;
    else return 'Nothing to be verified';
  }

  override toBool(data: Requirement | Project | Document): boolean {
    return this.toValue(data) !== null;
  }
}

export abstract class CatalogField<D extends IDataItem> extends DataField<
  D,
  Catalog | null
> {
  constructor() {
    super('catalog');
  }

  override toStr(data: D): string {
    const catalog = this.toValue(data);
    return catalog
      ? (catalog.reference ? catalog.reference + ' ' : '') + catalog.title
      : 'No catalog';
  }
}

export abstract class CatalogModuleField<D extends IDataItem> extends DataField<
  D,
  CatalogModule | null
> {
  constructor() {
    super('catalog_module');
  }

  override toStr(data: D): string {
    const catalogModule = this.toValue(data);
    return catalogModule
      ? (catalogModule.reference ? catalogModule.reference + ' ' : '') +
          catalogModule.title
      : 'No catalog module';
  }
}
