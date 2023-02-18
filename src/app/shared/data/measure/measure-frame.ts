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
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
  Filters,
} from '../filter';
import { IQueryParams } from '../../services/query-params.service';
import { Measure, MeasureService } from '../../services/measure.service';
import { Requirement } from '../../services/requirement.service';
import { MeasureReferencesFilter } from './measure-filters';
import { StatusField, TextField } from '../custom/custom-fields';
import {
  DocumentField,
  JiraIssueField,
  VerifiedField,
} from '../measure/measure-fields';
import {
  CompletionCommentColumn,
  ComplianceCommentColumn,
  ComplianceStatusColumn,
  DescriptionColumn,
  SummaryColumn,
  VerificationCommentColumn,
} from '../custom/custom-colums';
import { DocumentService } from '../../services/document.service';
import { DocumentsFilter } from '../document/document-filters';

export class MeasureDataFrame extends DataFrame<Measure> {
  constructor(
    protected _measureService: MeasureService,
    protected _documentService: DocumentService,
    protected _requirement: Requirement,
    initQueryParams: IQueryParams = {}
  ) {
    // Reference column
    const referenceColumn = new DataColumn(
      new TextField('reference', 'Reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new MeasureReferencesFilter(
          _measureService,
          _requirement.project,
          initQueryParams
        ),
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    // Document column
    const documentColumn = new DataColumn(
      new DocumentField(),
      new Filters(
        'Documents',
        undefined,
        new DocumentsFilter(
          _documentService,
          _requirement.project,
          initQueryParams
        ),
        new FilterForExistence('has_document', initQueryParams)
      ),
      initQueryParams
    );

    // Jira issue column
    const jiraIssueColumn = new DataColumn(
      new JiraIssueField(false),
      new Filters(
        'Jira Issues',
        undefined,
        undefined,
        new FilterForExistence('has_jira_issue', initQueryParams)
      ),
      initQueryParams
    );

    // Completion status column
    const completionStatusColumn = new DataColumn(
      new StatusField('completion_status', 'Completion'),
      new Filters(
        'Completion Statuses',
        undefined,
        new FilterByValues(
          'completion_statuses',
          [
            { value: 'open', label: 'Open' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ],
          initQueryParams
        ),
        new FilterForExistence('has_completion_status', initQueryParams)
      ),
      initQueryParams
    );

    // Verification method column
    const verificationMethodColumn = new DataColumn(
      new StatusField('verification_method', 'Verification Method'),
      new Filters(
        'Verification Methods',
        undefined,
        new FilterByValues(
          'verification_methods',
          [
            { value: 'I', label: 'Inspection (I)' },
            { value: 'T', label: 'Test (T)' },
            { value: 'R', label: 'Review (R)' },
          ],
          initQueryParams
        ),
        new FilterForExistence('has_verification_method', initQueryParams)
      ),
      initQueryParams
    );

    // Verified column
    const verifiedColumn = new DataColumn(
      new VerifiedField(),
      new Filters(
        'Verified',
        undefined,
        undefined,
        new FilterForExistence('verified', initQueryParams)
      ),
      initQueryParams
    );

    super(
      [
        referenceColumn,
        new SummaryColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        documentColumn,
        jiraIssueColumn,
        new ComplianceStatusColumn(initQueryParams),
        new ComplianceCommentColumn(initQueryParams),
        completionStatusColumn,
        new CompletionCommentColumn(initQueryParams),
        verificationMethodColumn,
        verifiedColumn,
        new VerificationCommentColumn(initQueryParams),
        new PlaceholderColumn('options', 'Options'),
      ],
      initQueryParams
    );
    this.reload();
  }

  override getColumnNames(): Observable<string[]> {
    return this._measureService.getMeasureFieldNames({
      project_ids: this._requirement.project.id,
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
