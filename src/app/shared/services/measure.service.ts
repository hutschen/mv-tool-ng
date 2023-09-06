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
import { CRUDService, IPage } from './crud.service';
import { IQueryParams } from './query-params.service';
import { IDocument, Document } from './document.service';
import { DownloadService } from './download.service';
import { IJiraIssue } from './jira-issue.service';
import {
  IRequirement,
  Requirement,
  RequirementService,
} from './requirement.service';
import { UploadService } from './upload.service';
import { ComplianceStatus } from '../compliance';
import { CompletionStatus } from '../completion';
import { VerificationMethod, VerificationStatus } from '../verification';
import { IAutoNumber } from '../components/auto-number-input.component';

export interface IMeasureInput {
  reference?: string | null;
  summary: string;
  description?: string | null;
  compliance_status?: ComplianceStatus | null;
  compliance_comment?: string | null;
  completion_status?: CompletionStatus | null;
  completion_comment?: string | null;
  verification_method?: VerificationMethod | null;
  verification_status?: VerificationStatus | null;
  verification_comment?: string | null;
  jira_issue_id?: string | null;
  document_id?: number | null;
}

export interface IMeasurePatch
  extends Omit<Partial<IMeasureInput>, 'reference'> {
  reference?: string | IAutoNumber | null;
}

export interface IMeasure {
  id: number;
  reference?: string | null;
  summary: string;
  description?: string | null;
  compliance_status?: ComplianceStatus | null;
  compliance_comment?: string | null;
  completion_status?: CompletionStatus | null;
  completion_comment?: string | null;
  verification_method?: VerificationMethod | null;
  verification_status?: VerificationStatus | null;
  verification_comment?: string | null;
  jira_issue_id?: string | null;
  jira_issue?: IJiraIssue | null;
  requirement: IRequirement;
  document?: IDocument | null;
}

export class Measure implements IMeasure {
  id: number;
  reference: string | null;
  summary: string;
  description: string | null;
  compliance_status: ComplianceStatus | null;
  compliance_comment: string | null;
  completion_status: CompletionStatus | null;
  completion_comment: string | null;
  verification_method: VerificationMethod | null;
  verification_status: VerificationStatus | null;
  verification_comment: string | null;
  jira_issue_id: string | null;
  jira_issue: IJiraIssue | null;
  requirement: Requirement;
  document: Document | null;

  constructor(measure: IMeasure) {
    this.id = measure.id;
    this.reference = measure.reference ?? null;
    this.summary = measure.summary;
    this.description = measure.description ?? null;
    this.compliance_status = measure.compliance_status ?? null;
    this.compliance_comment = measure.compliance_comment ?? null;
    this.completion_status = measure.completion_status ?? null;
    this.completion_comment = measure.completion_comment ?? null;
    this.verification_status = measure.verification_status ?? null;
    this.verification_method = measure.verification_method ?? null;
    this.verification_comment = measure.verification_comment ?? null;
    this.jira_issue_id = measure.jira_issue_id ?? null;
    this.jira_issue = measure.jira_issue ?? null;
    this.requirement = new Requirement(measure.requirement);
    this.document = measure.document ? new Document(measure.document) : null;
  }

  toMeasureInput(): IMeasureInput {
    return {
      reference: this.reference,
      summary: this.summary,
      description: this.description,
      compliance_status: this.compliance_status,
      compliance_comment: this.compliance_comment,
      completion_status: this.completion_status,
      completion_comment: this.completion_comment,
      verification_method: this.verification_method,
      verification_comment: this.verification_comment,
      verification_status: this.verification_status,
      jira_issue_id: this.jira_issue_id,
      document_id: this.document ? this.document.id : null,
    };
  }

  get completed(): boolean {
    return this.completion_status === 'completed';
  }

  get verified(): boolean {
    return this.verification_status === 'verified';
  }

  get hasLinkedJiraIssue(): boolean {
    return this.jira_issue !== null || this.jira_issue_id !== null;
  }

  get hasPermissionOnJiraIssue(): boolean {
    return (
      (this.jira_issue === null && this.jira_issue_id === null) ||
      (this.jira_issue !== null && this.jira_issue_id !== null)
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class MeasureService {
  constructor(
    protected _crud_measure: CRUDService<
      IMeasureInput,
      IMeasure,
      IMeasurePatch
    >,
    protected _crud_str: CRUDService<string, string>,
    protected _download: DownloadService,
    protected _upload: UploadService,
    protected _requirements: RequirementService
  ) {}

  getMeasuresUrl(requirementId: number): string {
    return `${this._requirements.getRequirementUrl(requirementId)}/measures`;
  }

  getMeasureUrl(measureId: number): string {
    return `measures/${measureId}`;
  }

  queryMeasures(params: IQueryParams = {}) {
    return this._crud_measure.query('measures', params).pipe(
      map((measures) => {
        if (Array.isArray(measures)) {
          return measures.map((m) => new Measure(m));
        } else {
          return {
            ...measures,
            items: measures.items.map((m) => new Measure(m)),
          } as IPage<Measure>;
        }
      })
    );
  }

  createMeasure(
    requirementId: number,
    measureInput: IMeasureInput
  ): Observable<Measure> {
    return this._crud_measure
      .create(this.getMeasuresUrl(requirementId), measureInput)
      .pipe(map((measure) => new Measure(measure)));
  }

  getMeasure(measureId: number): Observable<Measure> {
    return this._crud_measure
      .read(this.getMeasureUrl(measureId))
      .pipe(map((measure) => new Measure(measure)));
  }

  updateMeasure(
    measureId: number,
    measureInput: IMeasureInput
  ): Observable<Measure> {
    return this._crud_measure
      .update(this.getMeasureUrl(measureId), measureInput)
      .pipe(map((measure) => new Measure(measure)));
  }

  patchMeasures(
    measurePatch: IMeasurePatch,
    params: IQueryParams = {}
  ): Observable<Measure[]> {
    return this._crud_measure
      .patchMany('measures', measurePatch, params)
      .pipe(map((measures) => measures.map((m) => new Measure(m))));
  }

  patchMeasure(
    measureId: number,
    measurePatch: IMeasurePatch
  ): Observable<Measure> {
    return this._crud_measure
      .patch(this.getMeasureUrl(measureId), measurePatch)
      .pipe(map((measure) => new Measure(measure)));
  }

  deleteMeasure(measureId: number): Observable<null> {
    return this._crud_measure.delete(this.getMeasureUrl(measureId));
  }

  deleteMeasures(params: IQueryParams = {}): Observable<null> {
    return this._crud_measure.delete('measures', params);
  }

  getMeasureFieldNames(params: IQueryParams = {}) {
    return this._crud_str.query(
      'measure/field-names',
      params // comment to force formatter to keep this line break
    ) as Observable<string[]>;
  }

  getMeasureReferences(params: IQueryParams = {}) {
    return this._crud_str.query('measure/references', params);
  }

  downloadMeasureCsv(params: IQueryParams = {}) {
    return this._download.download('csv/measures', params);
  }

  downloadMeasureExcel(params: IQueryParams = {}) {
    return this._download.download('excel/measures', params);
  }

  getMeasureExcelColumnNames(): Observable<string[]> {
    return this._crud_str.query(
      'excel/measures/column-names' //
    ) as Observable<string[]>;
  }

  uploadMeasureExcel(file: File, params: IQueryParams = {}) {
    return this._upload.upload('excel/measures', file, params);
  }
}
