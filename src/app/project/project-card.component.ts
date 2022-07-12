import { Component, Input } from '@angular/core';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-card',
  template: `
    <div fxLayout="column" *ngIf="project">
      <mat-card class="mat-elevation-z0">
        <mat-card-title>{{ project.name }}
        </mat-card-title>
        <mat-card-content *ngIf="project.description">
          <p>{{ project.description }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class ProjectCardComponent {
  @Input() project: Project | null = null;

  constructor() { }

}
