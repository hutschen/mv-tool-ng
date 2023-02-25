// Copyright (C) 2023 Helmar Hutschenreuter
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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project, ProjectService } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-measure-view',
  template: ` <p>project-measure-view works!</p> `,
  styles: [],
})
export class ProjectMeasureViewComponent implements OnInit {
  project!: Project;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const projectId = Number(this._route.snapshot.paramMap.get('projectId'));
    this._projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this._router.navigate(['/']);
        } else {
          throw error;
        }
      },
    });
  }
}
