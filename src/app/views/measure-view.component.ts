import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Requirement, RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-measure-view',
  template: `
    <div *ngIf="requirement" fxLayout="column">
      <mvtool-requirement-card [requirement]="requirement"></mvtool-requirement-card>
      <mat-divider></mat-divider>
      <mvtool-measure-table
        [requirementId]="requirement.id">
      </mvtool-measure-table>
    </div>
    <div *ngIf="!requirement" fxLayout="column" style="height: 50%" fxLayoutAlign="center center">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: []
})
export class MeasureViewComponent implements OnInit {
  requirement: Requirement | null = null;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _requirementService: RequirementService) { }

  async ngOnInit(): Promise<void> {
    const requirementId = Number(this._route.snapshot.paramMap.get('requirementId'))
    this.requirement = await this._requirementService.getRequirement(requirementId);
  }
}
