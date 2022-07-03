import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Requirement } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirement-view',
  template: `
    <mvtool-requirement-table 
      (requirementClicked)="onRequirementClicked($event)">
    </mvtool-requirement-table>
  `,
  styles: []
})
export class RequirementViewComponent implements OnInit {
  projectId: number | null = null

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router) { }

  ngOnInit() {
    this.projectId = Number(this._route.snapshot.paramMap.get('projectId'))
  }

  onRequirementClicked(requirement: Requirement) {
    this._router.navigate(['/requirements', requirement.id, 'measures']);
  }
}
