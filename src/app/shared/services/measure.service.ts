import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IRequirement, RequirementService } from './requirement.service';

export interface IMeasureInput {
  summary: string
  description?: string | null
}

export interface IMeasure extends IMeasureInput {
  id: number
  requirement: IRequirement
}

@Injectable({
  providedIn: 'root'
})
export class MeasureService {

  constructor(
    protected _crud: CRUDService<IMeasureInput, IMeasure>,
    protected _requirements: RequirementService) {}

  getMeasuresUrl(requirementId: number): string {
    return `${this._requirements.getRequirementUrl(requirementId)}/measures`
  }

  getMeasureUrl(measureId: number): string {
    return `measures/${measureId}`
  }

  async listMeasures(requirementId: number): Promise<IMeasure[]> {
    return this._crud.list(this.getMeasuresUrl(requirementId))
  }

  async createMeasure(
      requirementId: number, measureInput: IMeasureInput): Promise<IMeasure> {
    return this._crud.create(this.getMeasuresUrl(requirementId), measureInput)
  }

  async getMeasure(measureId: number): Promise<IMeasure> {
    return this._crud.read(this.getMeasureUrl(measureId))
  }

  async updateMeasure(
      measureId: number, measureInput: IMeasureInput): Promise<IMeasure> {
    return this._crud.update(this.getMeasureUrl(measureId), measureInput)
  }

  async deleteMeasure(measureId: number): Promise<null> {
    return this._crud.delete(this.getMeasureUrl(measureId))
  }
}
