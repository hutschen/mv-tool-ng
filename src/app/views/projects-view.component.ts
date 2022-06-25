import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-projects-view',
  template: `
    <mvtool-project-table></mvtool-project-table>
  `,
  styles: [
  ]
})
export class ProjectsViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
