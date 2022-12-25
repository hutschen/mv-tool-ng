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
import { CRUDService } from './crud.service';
import { IDocument, Document } from './document.service';
import { DownloadService, IDownloadState } from './download.service';
import { IJiraIssue } from './jira-issue.service';
import {
  IRequirement,
  Requirement,
  RequirementService,
} from './requirement.service';
import { IUploadState, UploadService } from './upload.service';

export interface IMeasureInput {
  summary: string;
  description?: string | null;
  completed: boolean;
  jira_issue_id?: string | null;
  document_id?: number | null;
}

export interface IMeasure {
  id: number;
  summary: string;
  description?: string | null;
  completed: boolean;
  jira_issue_id?: string | null;
  jira_issue?: IJiraIssue | null;
  requirement: IRequirement;
  document?: IDocument | null;
}

export class Measure implements IMeasure {
  id: number;
  summary: string;
  description: string | null;
  completed: boolean;
  jira_issue_id: string | null;
  jira_issue: IJiraIssue | null;
  requirement: Requirement;
  document: Document | null;

  constructor(measure: IMeasure) {
    this.id = measure.id;
    this.summary = measure.summary;
    this.description = measure.description ?? null;
    this.completed = measure.completed;
    this.jira_issue_id = measure.jira_issue_id ?? null;
    this.jira_issue = measure.jira_issue ?? null;
    this.requirement = new Requirement(measure.requirement);
    this.document = measure.document ? new Document(measure.document) : null;
  }

  toMeasureInput(): IMeasureInput {
    return {
      summary: this.summary,
      description: this.description,
      completed: this.completed,
      jira_issue_id: this.jira_issue_id,
      document_id: this.document ? this.document.id : null,
    };
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
    protected _crud: CRUDService<IMeasureInput, IMeasure>,
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

  listMeasures(requirementId: number): Observable<Measure[]> {
    return this._crud
      .list(this.getMeasuresUrl(requirementId))
      .pipe(map((measures) => measures.map((m) => new Measure(m))));
  }

  createMeasure(
    requirementId: number,
    measureInput: IMeasureInput
  ): Observable<Measure> {
    return this._crud
      .create(this.getMeasuresUrl(requirementId), measureInput)
      .pipe(map((measure) => new Measure(measure)));
  }

  getMeasure(measureId: number): Observable<Measure> {
    return this._crud
      .read(this.getMeasureUrl(measureId))
      .pipe(map((measure) => new Measure(measure)));
  }

  updateMeasure(
    measureId: number,
    measureInput: IMeasureInput
  ): Observable<Measure> {
    return this._crud
      .update(this.getMeasureUrl(measureId), measureInput)
      .pipe(map((measure) => new Measure(measure)));
  }

  deleteMeasure(measureId: number): Observable<null> {
    return this._crud.delete(this.getMeasureUrl(measureId));
  }

  downloadMeasureExcel(requirementId: number): Observable<IDownloadState> {
    const url = `${this.getMeasuresUrl(requirementId)}/excel`;
    return this._download.download(url);
  }

  uploadMeasureExcel(
    requirementId: number,
    file: File
  ): Observable<IUploadState> {
    const url = `${this.getMeasuresUrl(requirementId)}/excel`;
    return this._upload.upload(url, file);
  }
}
