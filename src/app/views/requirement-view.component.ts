import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project, ProjectService } from '../shared/services/project.service';
import { Requirement } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirement-view',
  template: `
    <div *ngIf="project" fxLayout="column">
      <mvtool-project-card [project]="project"></mvtool-project-card>
      <mat-divider></mat-divider>
      <mvtool-requirement-table 
        [project]="project"
        (requirementClicked)="onRequirementClicked($event)">
      </mvtool-requirement-table>
    </div>
    <div *ngIf="!project" fxLayout="column" style="height: 50%" fxLayoutAlign="center center">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [
  ]
})
export class RequirementViewComponent implements OnInit {
  project: Project | null = null;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _projectService: ProjectService) { }

  async ngOnInit(): Promise<void> {
    const projectId = Number(this._route.snapshot.paramMap.get('projectId'))
    this.project = await this._projectService.getProject(projectId);
  }

  onRequirementClicked(requirement: Requirement) {
    this._router.navigate(['/requirements', requirement.id, 'measures']);
  }
}
