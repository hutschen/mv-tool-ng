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
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  CatalogRequirement,
  ICatalogRequirement,
} from './catalog-requirement.service';
import { CRUDService } from './crud.service';
import { DownloadService, IDownloadState } from './download.service';
import { IProject, Project, ProjectService } from './project.service';
import { IUploadState, UploadService } from './upload.service';

export interface IRequirementInput {
  reference?: string | null;
  summary: string;
  description?: string | null;
  target_object?: string | null;
  compliance_status?: string | null;
  compliance_comment?: string | null;
}

export interface IRequirement extends IRequirementInput {
  id: number;
  project: IProject;
  catalog_requirement?: ICatalogRequirement | null;
  completion?: number | null;
}

export class Requirement implements IRequirement {
  id: number;
  reference?: string | null;
  summary: string;
  description?: string | null;
  target_object?: string | null;
  compliance_status?: string | null;
  compliance_comment?: string | null;
  project: Project;
  catalog_requirement?: CatalogRequirement | null;
  completion?: number | null;

  constructor(requirement: IRequirement) {
    this.id = requirement.id;
    this.reference = requirement.reference;
    this.summary = requirement.summary;
    this.description = requirement.description;
    this.target_object = requirement.target_object;
    this.compliance_status = requirement.compliance_status;
    this.compliance_comment = requirement.compliance_comment;
    this.project = new Project(requirement.project);
    this.catalog_requirement = requirement.catalog_requirement
      ? new CatalogRequirement(requirement.catalog_requirement)
      : null;
    this.completion = requirement.completion;
  }

  toRequirementInput(): IRequirementInput {
    return {
      reference: this.reference,
      summary: this.summary,
      description: this.description,
      target_object: this.target_object,
      compliance_status: this.compliance_status,
      compliance_comment: this.compliance_comment,
    };
  }

  get percentComplete(): number | null {
    if (this.completion === null || this.completion === undefined) {
      return null;
    } else {
      return Math.round(this.completion * 100);
    }
  }

  get gsAnforderungReference(): string | null {
    return this.catalog_requirement?.gs_anforderung_reference || null;
  }

  get gsAbsicherung(): string | null {
    return this.catalog_requirement?.gs_absicherung || null;
  }

  get gsVerantwortliche(): string | null {
    return this.catalog_requirement?.gs_verantwortliche || null;
  }
}

@Injectable({
  providedIn: 'root',
})
export class RequirementService {
  constructor(
    protected _crud: CRUDService<IRequirementInput, IRequirement>,
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

  async listRequirements(projectId: number): Promise<Requirement[]> {
    const requirements$ = this._crud
      .list(this.getRequirementsUrl(projectId))
      .pipe(map((requirements) => requirements.map((r) => new Requirement(r))));
    return firstValueFrom(requirements$);
  }

  async createRequirement(
    projectId: number,
    requirementInput: IRequirementInput
  ): Promise<Requirement> {
    const requirement$ = this._crud
      .create(this.getRequirementsUrl(projectId), requirementInput)
      .pipe(map((requirement) => new Requirement(requirement)));
    return firstValueFrom(requirement$);
  }

  async getRequirement(requirementId: number): Promise<Requirement> {
    const requirements$ = this._crud
      .read(this.getRequirementUrl(requirementId))
      .pipe(map((requirement) => new Requirement(requirement)));
    return firstValueFrom(requirements$);
  }

  async updateRequirement(
    requirementId: number,
    requirementInput: IRequirementInput
  ): Promise<Requirement> {
    const requirement$ = this._crud
      .update(this.getRequirementUrl(requirementId), requirementInput)
      .pipe(map((requirement) => new Requirement(requirement)));
    return firstValueFrom(requirement$);
  }

  async deleteRequirement(requirementId: number): Promise<null> {
    const delete$ = this._crud.delete(this.getRequirementUrl(requirementId));
    return firstValueFrom(delete$);
  }

  downloadRequirementsExcel(projectId: number): Observable<IDownloadState> {
    const url = `${this.getRequirementsUrl(projectId)}/excel`;
    return this._download.download(url);
  }

  uploadRequirementsExcel(
    projectId: number,
    file: File
  ): Observable<IUploadState> {
    const url = `${this.getRequirementsUrl(projectId)}/excel`;
    return this._upload.upload(url, file);
  }

  async importRequirements(
    projectId: number,
    catalogModuleIds: number[]
  ): Promise<Requirement[]> {
    const url = `${this.getRequirementsUrl(projectId)}/import`;
    const requirements$ = this._crud
      .import(url, catalogModuleIds)
      .pipe(map((requirements) => requirements.map((r) => new Requirement(r))));
    return firstValueFrom(requirements$);
  }
}
