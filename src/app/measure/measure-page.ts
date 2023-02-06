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

import { map, Observable } from 'rxjs';
import { DataColumn, DataFrame, PlaceholderColumn } from '../shared/data';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
  Filters,
  IFilterOption,
} from '../shared/filter';
import { IQueryParams } from '../shared/services/query-params.service';
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
    protected _measureService: MeasureService,
    protected _project: Project
  ) {
    super('references');
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request measure references
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
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

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    // Build query params to request measure references
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
      references: values,
    };

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

export class MeasureDataFrame extends DataFrame<Measure> {
  constructor(
    protected _measureService: MeasureService,
    protected _requirement: Requirement
  ) {
    // Reference column
    const referenceColumn = new DataColumn(
      new StrField('reference', 'Reference'),
      new Filters(
        'References',
        new FilterByPattern('reference'),
        new ReferenceValuesFilter(_measureService, _requirement.project),
        new FilterForExistence('has_reference')
      )
    );

    // Summary column
    const summaryColumn = new DataColumn(
      new StrField('summary', 'Summary', false),
      new Filters(
        'Summaries',
        new FilterByPattern('summary'),
        undefined,
        new FilterForExistence('has_summary')
      )
    );

    // Description column
    const descriptionColumn = new DataColumn(
      new StrField('description', 'Description'),
      new Filters(
        'Descriptions',
        new FilterByPattern('description'),
        undefined,
        new FilterForExistence('has_description')
      )
    );

    // Document column
    const documentColumn = new DataColumn(
      new DocumentField(),
      new Filters(
        'Documents',
        undefined,
        undefined,
        new FilterForExistence('has_document')
      )
    );

    // Jira issue column
    const jiraIssueColumn = new DataColumn(
      new JiraIssueField(),
      new Filters(
        'Jira Issues',
        undefined,
        undefined,
        new FilterForExistence('has_jira_issue')
      )
    );

    // Compliance status column
    const complianceStatusColumn = new DataColumn(
      new StatusField('compliance_status', 'Compliance'),
      new Filters(
        'Compliance Statuses',
        undefined,
        new FilterByValues('compliance_statuses', [
          { value: 'C', label: 'Compliant (C)' },
          { value: 'PC', label: 'Partially Compliant (PC)' },
          { value: 'NC', label: 'Not Compliant (NC)' },
          { value: 'N/A', label: 'Not Applicable (N/A)' },
        ]),
        new FilterForExistence('has_compliance_status')
      )
    );

    // Compliance comment column
    const complianceCommentColumn = new DataColumn(
      new StrField('compliance_comment', 'Compliance Comment'),
      new Filters(
        'Compliance Comments',
        new FilterByPattern('compliance_comment'),
        undefined,
        new FilterForExistence('has_compliance_comment')
      )
    );

    // Completion status column
    const completionStatusColumn = new DataColumn(
      new StatusField('completion_status', 'Completion'),
      new Filters(
        'Completion Statuses',
        undefined,
        new FilterByValues('completion_statuses', [
          { value: 'open', label: 'Open' },
          { value: 'in progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
        ]),
        new FilterForExistence('has_completion_status')
      )
    );

    // Completion comment column
    const completionCommentColumn = new DataColumn(
      new StrField('completion_comment', 'Completion Comment'),
      new Filters(
        'Completion Comments',
        new FilterByPattern('completion_comment'),
        undefined,
        new FilterForExistence('has_completion_comment')
      )
    );

    // Verification method column
    const verificationMethodColumn = new DataColumn(
      new StrField('verification_method', 'Verification Method'),
      new Filters(
        'Verification Methods',
        undefined,
        new FilterByValues('verification_methods', [
          { value: 'I', label: 'Inspection (I)' },
          { value: 'T', label: 'Test (T)' },
          { value: 'R', label: 'Review (R)' },
        ]),
        new FilterForExistence('has_verification_method')
      )
    );

    // Verified column
    const verifiedColumn = new DataColumn(
      new VerifiedField(),
      new Filters(
        'Verified',
        undefined,
        undefined,
        new FilterForExistence('has_verified')
      )
    );

    // Verification comment column
    const verificationCommentColumn = new DataColumn(
      new StrField('verification_comment', 'Verification Comment'),
      new Filters(
        'Verification Comments',
        new FilterByPattern('verification_comment'),
        undefined,
        new FilterForExistence('has_verification_comment')
      )
    );

    super([
      referenceColumn,
      summaryColumn,
      descriptionColumn,
      documentColumn,
      jiraIssueColumn,
      complianceStatusColumn,
      complianceCommentColumn,
      completionStatusColumn,
      completionCommentColumn,
      verificationMethodColumn,
      verifiedColumn,
      verificationCommentColumn,
      new PlaceholderColumn('options', 'Options'),
    ]);
  }

  override getColumnNames(): Observable<string[]> {
    return this._measureService.getMeasureFieldNames({
      project_ids: [this._requirement.project.id],
    });
  }

  override getData(queryParams: IQueryParams): Observable<Measure[]> {
    // Query measures, and set the length of the data frame
    return this._measureService
      .queryMeasures({
        requirement_ids: this._requirement.id,
        ...queryParams,
      })
      .pipe(
        map((measures) => {
          if (Array.isArray(measures)) {
            this.length = measures.length;
            return measures;
          } else {
            this.length = measures.total_count;
            return measures.items;
          }
        })
      );
  }
}
