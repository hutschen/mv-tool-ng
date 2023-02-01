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

import { debounce, debounceTime, map, Observable, of } from 'rxjs';
import { DataPage, PlaceholderField } from '../shared/data';
import { FilterByValues, IFilterOption } from '../shared/filter';
import { IQueryParams } from '../shared/services/crud.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Project } from '../shared/services/project.service';
import { Requirement } from '../shared/services/requirement.service';
import {
  DocumentField,
  JiraIssueField,
  StatusField,
  StrField,
  VerifiedField,
} from './measure-fields';

class ReferenceValuesFilter extends FilterByValues {
  override hasToLoadOptions: boolean = true;

  constructor(
    protected _measurePage: MeasureDataPage,
    protected _measureService: MeasureService
  ) {
    super('references');
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request measure references
    const queryParams: IQueryParams = {
      project_ids: this._measurePage.project.id,
    };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    // Request measure references and convert them to filter options
    return this._measureService.getMeasureReferences(queryParams).pipe(
      map((references) => {
        if (!Array.isArray(references)) references = references.items;
        return references.map((reference) => ({
          value: reference,
          label: reference,
        }));
      })
    );
  }
}

export class MeasureDataPage extends DataPage<Measure> {
  public requirement!: Requirement;
  public project!: Project;

  constructor(measureService: MeasureService) {
    super();

    // Reference column
    const reference = this.addColumn(new StrField('reference', 'Reference'));
    reference.setPatternFilter('reference');
    reference.filterByValues = new ReferenceValuesFilter(this, measureService);
    reference.setExistenceFilter('has_reference');

    // Summary column
    const summary = this.addColumn(new StrField('summary', 'Summary', false));
    summary.setPatternFilter('summary');
    summary.setExistenceFilter('has_summary');

    // Description column
    const description = this.addColumn(
      new StrField('description', 'Description')
    );
    description.setPatternFilter('description');
    description.setExistenceFilter('has_description');

    // Document column
    this.addColumn(new DocumentField());

    // Jira Issue column
    const jiraIssue = this.addColumn(new JiraIssueField());
    jiraIssue.setExistenceFilter('has_jira_issue');

    // Compliance status column
    const compliance = this.addColumn(
      new StatusField('compliance_status', 'Compliance')
    );
    compliance.setPatternFilter('compliance_status');
    compliance.setValuesFilter('compliance_statuses', [
      { value: 'C', label: 'Compliant' },
      { value: 'PC', label: 'Partially Compliant' },
      { value: 'NC', label: 'Not Compliant' },
      { value: 'N/A', label: 'Not Applicable' },
    ]);
    compliance.setExistenceFilter('has_compliance_status');

    // Compliance comment column
    const compliance_comment = this.addColumn(
      new StrField('compliance_comment', 'Compliance Comment')
    );
    compliance_comment.setPatternFilter('compliance_comment');
    compliance_comment.setExistenceFilter('has_compliance_comment');

    // Completion status column
    const completion = this.addColumn(
      new StatusField('completion_status', 'Completion')
    );
    completion.setPatternFilter('completion_status');
    completion.setValuesFilter('completion_statuses', [
      { value: 'open', label: 'Open' },
      { value: 'in progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ]);
    completion.setExistenceFilter('has_completion_status');

    // Completion comment column
    const completion_comment = this.addColumn(
      new StrField('completion_comment', 'Completion Comment')
    );
    completion_comment.setPatternFilter('completion_comment');
    completion_comment.setExistenceFilter('has_completion_comment');

    // Verification method column
    const verification_method = this.addColumn(
      new StatusField('verification_method', 'Verification Method')
    );
    verification_method.setPatternFilter('verification_method');
    verification_method.setValuesFilter('verification_methods', [
      { value: 'I', label: 'Inspection' },
      { value: 'T', label: 'Test' },
      { value: 'R', label: 'Review' },
    ]);
    verification_method.setExistenceFilter('has_verification_method');

    // Verified column
    const verified = this.addColumn(new VerifiedField());
    verified.setExistenceFilter('verified');

    // Verification comment column
    const verification_comment = this.addColumn(
      new StrField('verification_comment', 'Verification Comment')
    );
    verification_comment.setPatternFilter('verification_comment');
    verification_comment.setExistenceFilter('has_verification_comment');

    // Options column
    this.addColumn(new PlaceholderField<Measure>('options', 'Options'));
  }

  initialize(requirement: Requirement) {
    this.requirement = requirement;
    this.project = requirement.project;

    // TODO: initialize fetching data
  }
}
