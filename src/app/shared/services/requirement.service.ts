import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IProject, Project, ProjectService } from './project.service';

export interface IRequirementInput {
  reference: string | null;
  summary: string;
  description: string | null;
  target_object: string | null;
  compliance_status: string | null;
  compliance_comment: string | null;
}

export interface IRequirement extends IRequirementInput {
  id: number;
  project: IProject;
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

  constructor(requirement: IRequirement) {
    this.id = requirement.id;
    this.reference = requirement.reference;
    this.summary = requirement.summary;
    this.description = requirement.description;
    this.target_object = requirement.target_object;
    this.compliance_status = requirement.compliance_status;
    this.compliance_comment = requirement.compliance_comment;
    this.project = new Project(requirement.project);
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
}

@Injectable({
  providedIn: 'root',
})
export class RequirementService {
  constructor(
    protected _crud: CRUDService<IRequirementInput, IRequirement>,
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
}
