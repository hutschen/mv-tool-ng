import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mvtool-task-view',
  template: `
    <mvtool-task-table
      [measureId]="measureId">
    </mvtool-task-table>
  `,
  styles: [
  ]
})
export class TaskViewComponent implements OnInit {
  measureId: number | null = null

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router) { }

  ngOnInit(): void {
    this.measureId = Number(this._route.snapshot.paramMap.get('measureId'))
  }

}
