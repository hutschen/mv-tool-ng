import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IRequirement, Requirement, RequirementService } from './requirement.service';

export interface IMeasureInput {
  summary: string
  description: string | null
}

export interface IMeasure extends IMeasureInput {
  id: number
  requirement: IRequirement
}

export class Measure implements IMeasure {
  id: number;
  summary: string;
  description: string | null;
  requirement: Requirement;

  constructor(measure: IMeasure) {
    this.id = measure.id
    this.summary = measure.summary
    this.description = measure.description
    this.requirement = new Requirement(measure.requirement)
  }
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

  async listMeasures(requirementId: number): Promise<Measure[]> {
    const measures = await this._crud.list(this.getMeasuresUrl(requirementId))
    return measures.map(measure => new Measure(measure))
  }

  async createMeasure(
      requirementId: number, measureInput: IMeasureInput): Promise<Measure> {
    const measure = await this._crud.create(
      this.getMeasuresUrl(requirementId), measureInput)
    return new Measure(measure)
  }

  async getMeasure(measureId: number): Promise<Measure> {
    const measure = await this._crud.read(this.getMeasureUrl(measureId))
    return new Measure(measure)
  }

  async updateMeasure(
      measureId: number, measureInput: IMeasureInput): Promise<Measure> {
    const measure = await this._crud.update(
      this.getMeasureUrl(measureId), measureInput)
    return new Measure(measure)

  }

  async deleteMeasure(measureId: number): Promise<null> {
    return this._crud.delete(this.getMeasureUrl(measureId))
  }
}
