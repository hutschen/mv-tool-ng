import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IDocument, Document } from './document.service';
import { IJiraIssue } from './jira-issue.service';
import { IRequirement, Requirement, RequirementService } from './requirement.service';

export interface IMeasureInput {
  summary: string
  description: string | null
  completed: boolean
  jira_issue_id: string | null
  document_id: number | null
}

export interface IMeasure {
  id: number
  summary: string
  description: string | null
  completed: boolean
  jira_issue_id: string | null
  jira_issue: IJiraIssue | null
  requirement: IRequirement
  document: IDocument | null
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
    this.id = measure.id
    this.summary = measure.summary
    this.description = measure.description
    this.completed = measure.completed
    this.jira_issue_id = measure.jira_issue_id
    this.jira_issue = measure.jira_issue
    this.requirement = new Requirement(measure.requirement)
    this.document = measure.document ? new Document(measure.document) : null
  }

  toMeasureInput(): IMeasureInput {
    return {
      summary: this.summary,
      description: this.description,
      completed: this.completed,
      jira_issue_id: this.jira_issue_id,
      document_id: this.document ? this.document.id : null
    }
  }

  get hasJiraIssue(): boolean {
    return (this.jira_issue !== null || this.jira_issue_id !== null)
  }

  get hasPermissionOnJiraIssue(): boolean {
    return (
      (this.jira_issue === null && this.jira_issue_id === null) || 
      (this.jira_issue !== null && this.jira_issue_id !== null))
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
