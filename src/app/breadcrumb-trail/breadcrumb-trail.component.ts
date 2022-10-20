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

import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { CatalogService } from '../shared/services/catalog.service';
import { ProjectService } from '../shared/services/project.service';

interface IBreadcrumbTrailState {
  isCatalogRelatedView: boolean;
  isProjectRelatedView: boolean;
}

@Component({
  selector: 'mvtool-breadcrumb-trail',
  template: `
    <div *ngIf="state$ | async as state">
      <p>breadcrumb-trail works! {{ state | json }}</p>
      <mvtool-catalog-breadcrumbs
        *ngIf="state.isCatalogRelatedView"
      ></mvtool-catalog-breadcrumbs>
      <mvtool-project-breadcrumbs
        *ngIf="state.isProjectRelatedView"
      ></mvtool-project-breadcrumbs>
    </div>
  `,
  styles: [],
})
export class BreadcrumbTrailComponent {
  state$: Observable<IBreadcrumbTrailState | null>;

  constructor(
    protected _router: Router,
    protected _catalogService: CatalogService,
    protected _projectService: ProjectService
  ) {
    this.state$ = this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event as NavigationEnd),
      map((event) =>
        event.urlAfterRedirects.split('/').filter((part) => part.length > 0)
      ),
      map((urlParts) => {
        const firstUrlPart = urlParts[0];
        const catalogRelatedParts = ['catalogs', 'catalog-modules'];
        const projectRelatedParts = ['projects', 'requirements'];

        if (catalogRelatedParts.includes(firstUrlPart)) {
          return {
            isCatalogRelatedView: true,
            isProjectRelatedView: false,
          };
        } else if (projectRelatedParts.includes(firstUrlPart)) {
          return {
            isCatalogRelatedView: false,
            isProjectRelatedView: true,
          };
        } else {
          return null;
        }
      })
    );
  }
}
