import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IProject, ProjectService } from './project.service';

export interface IRequirementInput {
  reference?: string | null
  summary: string
  description?: string | null
  target_object?: string | null
  compliance_status?: string | null
  compliance_comment?: string | null
}
export interface IRequirement extends IRequirementInput {
  id: number
  project: IProject
}

@Injectable({
  providedIn: 'root'
})
export class RequirementService {

  constructor(
    protected _crud: CRUDService<IRequirementInput, IRequirement>,
    protected _projects: ProjectService) {}

  getRequirementsUrl(projectId: number): string {
    return `${this._projects.getProjectUrl(projectId)}/requirements`
  }

  getRequirementUrl(requirementId: number): string {
    return `requirements/${requirementId}`
  }

  async listRequirements(projectId: number): Promise<IRequirement[]> {
    return this._crud.list(this.getRequirementsUrl(projectId))
  }

  async createRequirement(
      projectId: number, 
      requirementInput: IRequirementInput): Promise<IRequirement> {
    return this._crud.create(
      this.getRequirementsUrl(projectId), requirementInput)
  }

  async getRequirement(requirementId: number): Promise<IRequirement> {
    return this._crud.read(this.getRequirementUrl(requirementId))
  }
  
  async updateRequirement(
      requirementId: number, 
      requirementInput: IRequirementInput): Promise<IRequirement> {
    return this._crud.update(
      this.getRequirementUrl(requirementId), requirementInput)
  }

  async deleteRequirement(requirementId: number): Promise<null> {
    return this._crud.delete(this.getRequirementUrl(requirementId))
  }
}
