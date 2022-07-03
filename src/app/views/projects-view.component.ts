import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-projects-view',
  template: `
    <mvtool-project-table 
      (projectClicked)="onProjectClicked($event)">
    </mvtool-project-table>
  `,
  styles: []
})
export class ProjectsViewComponent implements OnInit {

  constructor(protected _router: Router) { }

  ngOnInit(): void {
  }

  onProjectClicked(project: Project) {
    this._router.navigate(['/projects', project.id, 'requirements']);
  }

}
