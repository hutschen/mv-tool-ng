import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mvtool-requirement-view',
  template: `
    <p>
      requirement-view works!
    </p>
  `,
  styles: [
  ]
})
export class RequirementViewComponent implements OnInit {
  projectId: number | null = null

  constructor(protected _route: ActivatedRoute) { }

  ngOnInit() {
    this.projectId = Number(this._route.snapshot.paramMap.get('projectId'))
  }
}
