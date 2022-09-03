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
import { Observable } from 'rxjs';
import { CRUDService } from './crud.service';
import { DownloadService, IDownloadState } from './download.service';
import { IProject, Project, ProjectService } from './project.service';
import { IUploadState, UploadService } from './upload.service';

export interface IRequirementInput {
  reference: string | null;
  summary: string;
  description: string | null;
  target_object: string | null;
  compliance_status: string | null;
  compliance_comment: string | null;
}

export interface IGSBaustein {
  id: number;
  reference: string;
  title: string;
}

export interface IRequirement extends IRequirementInput {
  id: number;
  project: IProject;
  completion: number | null;

  // Special attributes for IT Grundschutz Kompendium
  gs_anforderung_reference: string | null;
  gs_absicherung: string | null;
  gs_verantwortliche: string | null;
  gs_baustein: IGSBaustein | null;
}

export class Requirement implements IRequirement {
  id: number;
  reference: string | null;
  summary: string;
  description: string | null;
  target_object: string | null;
  compliance_status: string | null;
  compliance_comment: string | null;
  project: Project;
  completion: number | null;

  // Special attributes for IT Grundschutz Kompendium
  gs_anforderung_reference: string | null;
  gs_absicherung: string | null;
  gs_verantwortliche: string | null;
  gs_baustein: IGSBaustein | null;

  constructor(requirement: IRequirement) {
    this.id = requirement.id;
    this.reference = requirement.reference;
    this.summary = requirement.summary;
    this.description = requirement.description;
    this.target_object = requirement.target_object;
    this.compliance_status = requirement.compliance_status;
    this.compliance_comment = requirement.compliance_comment;
    this.project = new Project(requirement.project);
    this.completion = requirement.completion;

    // Special attributes for IT Grundschutz Kompendium
    this.gs_anforderung_reference = requirement.gs_anforderung_reference;
    this.gs_absicherung = requirement.gs_absicherung;
    this.gs_verantwortliche = requirement.gs_verantwortliche;
    this.gs_baustein = requirement.gs_baustein;
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
    if (this.completion === null) {
      return null;
    } else {
      return Math.round(this.completion * 100);
    }
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
    const requirements = await this._crud.list(
      this.getRequirementsUrl(projectId)
    );
    return requirements.map((requirement) => new Requirement(requirement));
  }

  async createRequirement(
    projectId: number,
    requirementInput: IRequirementInput
  ): Promise<Requirement> {
    const requirement = await this._crud.create(
      this.getRequirementsUrl(projectId),
      requirementInput
    );
    return new Requirement(requirement);
  }

  async getRequirement(requirementId: number): Promise<Requirement> {
    const requirement = await this._crud.read(
      this.getRequirementUrl(requirementId)
    );
    return new Requirement(requirement);
  }

  async updateRequirement(
    requirementId: number,
    requirementInput: IRequirementInput
  ): Promise<Requirement> {
    const requirement = await this._crud.update(
      this.getRequirementUrl(requirementId),
      requirementInput
    );
    return new Requirement(requirement);
  }

  async deleteRequirement(requirementId: number): Promise<null> {
    return this._crud.delete(this.getRequirementUrl(requirementId));
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

  uploadGSBaustein(projectId: number, file: File): Observable<IUploadState> {
    const url = `${this.getRequirementsUrl(projectId)}/gs-baustein`;
    return this._upload.upload(url, file);
  }
}
