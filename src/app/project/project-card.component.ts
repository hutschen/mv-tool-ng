// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Component, Input } from '@angular/core';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-card',
  template: `
    <div fxLayout="column" *ngIf="project">
      <mat-card class="mat-elevation-z0">
        <mat-card-title>{{ project.name }} </mat-card-title>
        <mat-card-content *ngIf="project.description">
          <p>{{ project.description }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [],
})
export class ProjectCardComponent {
  @Input() project: Project | null = null;

  constructor() {}
}
