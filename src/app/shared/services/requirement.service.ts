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
import {
  CatalogRequirement,
  ICatalogRequirement,
} from './catalog-requirement.service';
import { CRUDService, IPage } from './crud.service';
import { IQueryParams } from './query-params.service';
import { DownloadService, IDownloadState } from './download.service';
import { IProject, Project, ProjectService } from './project.service';
import { IUploadState, UploadService } from './upload.service';
import { ComplianceStatus } from '../compliance';
import { IAutoNumber } from '../components/auto-number-input.component';

export interface IRequirementInput {
  reference?: string | null;
  summary: string;
  description?: string | null;
  target_object?: string | null;
  milestone?: string | null;
  compliance_status?: ComplianceStatus | null;
  compliance_comment?: string | null;
  catalog_requirement_id?: number | null;
}

export interface IRequirementPatch
  extends Omit<Partial<IRequirementInput>, 'reference'> {
  reference?: string | IAutoNumber | null;
}

export interface IRequirement {
  id: number;
  reference?: string | null;
  summary: string;
  description?: string | null;
  target_object?: string | null;
  milestone?: string | null;
  compliance_status?: ComplianceStatus | null;
  compliance_status_hint?: ComplianceStatus | null;
  compliance_comment?: string | null;
  project: IProject;
  catalog_requirement?: ICatalogRequirement | null;
  completion_count?: number;
  completed_count?: number;
  verification_count?: number;
  verified_count?: number;
}

export class Requirement implements IRequirement {
  id: number;
  reference?: string | null;
  summary: string;
  description: string | null;
  target_object: string | null;
  milestone: string | null;
  compliance_status: ComplianceStatus | null;
  compliance_status_hint: ComplianceStatus | null;
  compliance_comment: string | null;
  project: Project;
  catalog_requirement: CatalogRequirement | null;
  completion_count: number;
  completed_count: number;
  verification_count: number;
  verified_count: number;

  constructor(requirement: IRequirement) {
    this.id = requirement.id;
    this.reference = requirement.reference;
    this.summary = requirement.summary;
    this.description = requirement.description ?? null;
    this.target_object = requirement.target_object ?? null;
    this.milestone = requirement.milestone ?? null;
    this.compliance_status = requirement.compliance_status ?? null;
    this.compliance_status_hint = requirement.compliance_status_hint ?? null;
    this.compliance_comment = requirement.compliance_comment ?? null;
    this.project = new Project(requirement.project);
    this.catalog_requirement = requirement.catalog_requirement
      ? new CatalogRequirement(requirement.catalog_requirement)
      : null;
    this.completion_count = requirement.completion_count ?? 0;
    this.completed_count = requirement.completed_count ?? 0;
    this.verification_count = requirement.verification_count ?? 0; // prettier-ignore
    this.verified_count = requirement.verified_count ?? 0;
  }

  toRequirementInput(): IRequirementInput {
    return {
      reference: this.reference,
      summary: this.summary,
      description: this.description,
      target_object: this.target_object,
      milestone: this.milestone,
      compliance_status: this.compliance_status,
      compliance_comment: this.compliance_comment,
      catalog_requirement_id: this.catalog_requirement?.id || null,
    };
  }

  get gsAbsicherung(): string | null {
    return this.catalog_requirement?.gs_absicherung || null;
  }

  get gsVerantwortliche(): string | null {
    return this.catalog_requirement?.gs_verantwortliche || null;
  }
}

export interface IRequirementRepresentation {
  id: number;
  reference?: string | null;
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class RequirementService {
  constructor(
    protected _crud_requirement: CRUDService<
      IRequirementInput,
      IRequirement,
      IRequirementPatch
    >,
    protected _crud_str: CRUDService<null, string>,
    protected _crud_repr: CRUDService<null, IRequirementRepresentation>,
    protected _download: DownloadService,
    protected _upload: UploadService,
    protected _projects: ProjectService
  ) {}

  getRequirementsUrl(projectId: number): string {
    return `${this._projects.getProjectUrl(projectId)}/requirements`;
  }

  getRequirementUrl(requirementId: number): string {
    return `requirements/${requirementId}`;
  }

  queryRequirements(params: IQueryParams) {
    return this._crud_requirement.query('requirements', params).pipe(
      map((requirements) => {
        if (Array.isArray(requirements)) {
          return requirements.map((r) => new Requirement(r));
        } else {
          return {
            ...requirements,
            items: requirements.items.map((r) => new Requirement(r)),
          } as IPage<Requirement>;
        }
      })
    );
  }

  createRequirement(
    projectId: number,
    requirementInput: IRequirementInput
  ): Observable<Requirement> {
    return this._crud_requirement
      .create(this.getRequirementsUrl(projectId), requirementInput)
      .pipe(map((requirement) => new Requirement(requirement)));
  }

  getRequirement(requirementId: number): Observable<Requirement> {
    return this._crud_requirement
      .read(this.getRequirementUrl(requirementId))
      .pipe(map((requirement) => new Requirement(requirement)));
  }

  updateRequirement(
    requirementId: number,
    requirementInput: IRequirementInput
  ): Observable<Requirement> {
    return this._crud_requirement
      .update(this.getRequirementUrl(requirementId), requirementInput)
      .pipe(map((requirement) => new Requirement(requirement)));
  }

  patchRequirements(
    requirementPatch: IRequirementPatch,
    params: IQueryParams = {}
  ): Observable<Requirement[]> {
    return this._crud_requirement
      .patchMany('requirements', requirementPatch, params)
      .pipe(map((requirements) => requirements.map((r) => new Requirement(r))));
  }

  patchRequirement(
    requirementId: number,
    requirementPatch: IRequirementPatch
  ): Observable<Requirement> {
    return this._crud_requirement
      .patch(this.getRequirementUrl(requirementId), requirementPatch)
      .pipe(map((requirement) => new Requirement(requirement)));
  }

  deleteRequirement(requirementId: number): Observable<null> {
    return this._crud_requirement.delete(this.getRequirementUrl(requirementId));
  }

  deleteRequirements(params: IQueryParams = {}): Observable<null> {
    return this._crud_requirement.delete('requirements', params);
  }

  getRequirementFieldNames(params: IQueryParams = {}) {
    return this._crud_str.query(
      'requirement/field-names',
      params
    ) as Observable<string[]>;
  }

  getRequirementReferences(params: IQueryParams = {}) {
    return this._crud_str.query('requirement/references', params);
  }

  getRequirementRepresentations(params: IQueryParams = {}) {
    return this._crud_repr.query('requirement/representations', params);
  }

  importRequirements(
    projectId: number,
    catalogModuleIds: number[]
  ): Observable<Requirement[]> {
    const url = `${this.getRequirementsUrl(projectId)}/import`;
    return this._crud_requirement
      .import(url, catalogModuleIds)
      .pipe(map((requirements) => requirements.map((r) => new Requirement(r))));
  }

  downloadRequirementCsv(
    params: IQueryParams = {}
  ): Observable<IDownloadState> {
    return this._download.download('csv/requirements', params);
  }

  downloadRequirementExcel(
    params: IQueryParams = {}
  ): Observable<IDownloadState> {
    return this._download.download('excel/requirements', params);
  }

  getRequirementExcelColumnNames(): Observable<string[]> {
    return this._crud_str.query(
      'excel/requirements/column-names'
    ) as Observable<string[]>;
  }

  uploadRequirementCsv(file: File, params: IQueryParams = {}) {
    return this._upload.upload('csv/requirements', file, params);
  }

  uploadRequirementExcel(
    file: File,
    params: IQueryParams = {}
  ): Observable<IUploadState> {
    return this._upload.upload('excel/requirements', file, params);
  }
}
