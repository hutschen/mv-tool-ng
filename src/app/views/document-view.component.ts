import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mvtool-document-view',
  template: `
    <mvtool-document-table [projectId]="projectId">
    </mvtool-document-table>
  `,
  styles: []
})
export class DocumentViewComponent implements OnInit {
  projectId: number | null = null

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router) { }

  ngOnInit(): void {
    this.projectId = Number(this._route.snapshot.paramMap.get('projectId'))
  }
}
