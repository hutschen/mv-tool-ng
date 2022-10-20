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
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { CatalogService } from '../shared/services/catalog.service';
import { ProjectService } from '../shared/services/project.service';

interface IBreadcrumb {
  displayText: string;
  navigationCommands: any[];
  alternativeBreadcrumbs?: IBreadcrumb[];
}

@Component({
  selector: 'mvtool-breadcrumb-trail',
  template: `
    <div *ngIf="breadcrumbs.length">
      <div fxLayout="row">
        <div
          class="breadcrumb-trail"
          *ngFor="let breadcrumb of breadcrumbs; let i = index"
        >
          <button mat-button [routerLink]="breadcrumb.navigationCommands">
            {{ breadcrumb.displayText }}
          </button>
          <span *ngIf="i < breadcrumbs.length - 1">&sol;</span>
        </div>
      </div>
      <mat-divider></mat-divider>
    </div>
  `,
  styles: ['.breadcrumb-trail { padding: 5px 2px; }'],
})
export class BreadcrumbTrailComponent {
  breadcrumbs: IBreadcrumb[] = [];

  constructor(
    protected _router: Router,
    protected _catalogService: CatalogService,
    protected _projectService: ProjectService
  ) {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event as NavigationEnd),
        map((event) => event.urlAfterRedirects),
        map((url) => url.split('/').filter((s) => s.length > 0))
      )
      .subscribe(async (urlParts) => {
        this.breadcrumbs = await this._parseUrl(urlParts);
      });
  }

  protected async _parseCatalogUrl(urlParts: string[]): Promise<IBreadcrumb[]> {
    return [];
  }

  protected async _parseProjectUrl(urlParts: string[]): Promise<IBreadcrumb[]> {
    const head = urlParts.length > 0 ? urlParts[0] : null;
    const tail = urlParts.length > 1 ? urlParts.slice(1) : [];

    if (head) {
      const projectId = Number(head);
      const project = await this._projectService.getProject(projectId);
      return [
        {
          displayText: project.name,
          navigationCommands: ['projects', projectId, 'requirements'],
        },
        {
          displayText: 'Requirements',
          navigationCommands: [],
          alternativeBreadcrumbs: [
            {
              displayText: 'Documents',
              navigationCommands: ['projects', projectId, 'documents'],
            },
          ],
        },
      ];
    }

    return [];
  }

  protected async _parseRequirementUrl(
    urlParts: string[]
  ): Promise<IBreadcrumb[]> {
    return [];
  }

  protected async _parseUrl(urlParts: string[]): Promise<IBreadcrumb[]> {
    const head = urlParts.length > 0 ? urlParts[0] : null;
    const tail = urlParts.length > 1 ? urlParts.slice(1) : [];

    const allProjectsBreadcrumb = {
      displayText: 'All Projects',
      navigationCommands: ['projects'],
    };
    const allCatalogsBreadcrumb = {
      displayText: 'All Catalogs',
      navigationCommands: ['catalogs'],
    };

    switch (head) {
      case 'catalogs':
        return [allCatalogsBreadcrumb, ...(await this._parseCatalogUrl(tail))];
      case 'projects':
        return [allProjectsBreadcrumb, ...(await this._parseProjectUrl(tail))];
      case 'requirements':
        return [
          allProjectsBreadcrumb,
          ...(await this._parseRequirementUrl(tail)),
        ];
      default:
        return [];
    }
  }
}
