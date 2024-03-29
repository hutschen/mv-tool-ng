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

import { DataField } from '../data';
import { IJiraIssue } from '../../services/jira-issue.service';
import { Measure } from '../../services/measure.service';
import { Document } from '../../services/document.service';
import { Catalog } from '../../services/catalog.service';
import { CatalogField, CatalogModuleField } from '../custom/custom-fields';
import { CatalogModule } from '../../services/catalog-module.service';
import { Requirement } from '../../services/requirement.service';

export class MeasureCatalogField extends CatalogField<Measure> {
  override toValue(data: Measure): Catalog | null {
    return (
      data.requirement?.catalog_requirement?.catalog_module.catalog ?? null
    );
  }
}

export class MeasureCatalogModuleField extends CatalogModuleField<Measure> {
  override toValue(data: Measure): CatalogModule | null {
    return data.requirement?.catalog_requirement?.catalog_module ?? null;
  }
}

export class RequirementField extends DataField<Measure, Requirement> {
  constructor(optional: boolean = true) {
    super('requirement', null, optional);
  }

  override toStr(data: Measure): string {
    const requirement = this.toValue(data);
    return (
      (requirement.reference ? requirement.reference + ' ' : '') +
      requirement.summary
    );
  }
}

export class MilestoneField extends DataField<Measure, string | null> {
  constructor(optional: boolean = true) {
    super('milestone', null, optional);
  }

  override toValue(data: Measure): string | null {
    return data.requirement?.milestone ?? null;
  }
}

export class TargetObjectField extends DataField<Measure, string | null> {
  constructor(optional: boolean = true) {
    super('target_object', null, optional);
  }

  override toValue(data: Measure): string | null {
    return data.requirement?.target_object ?? null;
  }
}

export class DocumentField extends DataField<Measure, Document | null> {
  constructor(optional: boolean = true) {
    super('document', null, optional);
  }

  override toStr(data: Measure): string {
    const document = this.toValue(data);
    return document
      ? (document.reference ? document.reference + ' ' : '') + document.title
      : 'No document';
  }
}

export class JiraIssueField extends DataField<Measure, IJiraIssue | null> {
  constructor(optional: boolean = true) {
    super('jira_issue', 'Jira Issue', optional);
  }

  override toStr(data: Measure): string {
    if (data.jira_issue) {
      return data.jira_issue.key;
    } else if (data.jira_issue_id) {
      return 'No permission on Jira issue';
    } else {
      return 'No Jira issue assigned';
    }
  }
}
