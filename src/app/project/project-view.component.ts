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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-view',
  template: `
    <mvtool-project-table (clickProject)="onProjectClicked($event)">
    </mvtool-project-table>
  `,
  styles: [],
})
export class ProjectViewComponent implements OnInit {
  constructor(protected _router: Router) {}

  ngOnInit(): void {}

  onProjectClicked(project: Project) {
    this._router.navigate(['/projects', project.id, 'requirements']);
  }
}
