import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Measure } from '../shared/services/measure.service';
import { Requirement } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-measure-view',
  template: `
    <mvtool-measure-table
      [requirementId]="requirementId">
    </mvtool-measure-table>
  `,
  styles: [
  ]
})
export class MeasureViewComponent implements OnInit {
  requirementId: number | null = null

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router) { }

  ngOnInit(): void {
    this.requirementId = Number(this._route.snapshot.paramMap.get('requirementId'))
  }
}
