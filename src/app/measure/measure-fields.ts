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

import { DataField } from '../shared/data';
import { Document } from '../shared/services/document.service';
import { IJiraIssue } from '../shared/services/jira-issue.service';
import { Measure } from '../shared/services/measure.service';

export class DocumentField extends DataField<Measure, Document> {
  constructor(optional: boolean = false) {
    super('document', 'Document', optional);
  }

  override toStr(data: Measure): string {
    const document = this.toValue(data);
    return document
      ? (document.reference ? document.reference + ' ' : '') + document.title
      : 'No document';
  }
}

export class JiraIssueField extends DataField<Measure, IJiraIssue | null> {
  constructor(optional: boolean = false) {
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

export class StrField extends DataField<Measure, string> {}

export class StatusField extends DataField<Measure, string> {
  override toStr(data: Measure): string {
    const status = this.toValue(data);
    return status ? status : 'Not set';
  }
}

export class VerifiedField extends DataField<Measure, boolean> {
  constructor(optional: boolean = false) {
    super('verified', 'Verified', optional);
  }

  override toStr(data: Measure): string {
    return this.toValue(data) ? 'Verified' : 'Not verified';
  }
}
