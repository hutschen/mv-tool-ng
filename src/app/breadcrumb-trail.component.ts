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
import { isEqual } from 'radash';
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { CatalogModuleService } from './shared/services/catalog-module.service';
import { CatalogService } from './shared/services/catalog.service';
import { ProjectService } from './shared/services/project.service';
import { RequirementService } from './shared/services/requirement.service';

interface IBreadcrumb {
  displayText: string;
  navigationCommands: any[];
  alternativeBreadcrumbs?: IBreadcrumb[];
}

@Component({
  selector: 'mvtool-breadcrumb-trail',
  template: `
    <ng-container *ngIf="breadcrumbs$ | async as breadcrumbs">
      <ng-container *ngIf="breadcrumbs.length">
        <div class="fx-row fx-gap-5 margin-x-btn-container">
          <div
            class="fx-row fx-gap-5 fx-center-center margin-y-quarter"
            *ngFor="let breadcrumb of breadcrumbs; let i = index"
          >
            <!-- Breadcrumb without alternative breadcrumbs -->
            <ng-container *ngIf="!breadcrumb.alternativeBreadcrumbs?.length">
              <button mat-button [routerLink]="breadcrumb.navigationCommands">
                {{ breadcrumb.displayText | truncate : 25 }}
              </button>
            </ng-container>

            <!-- Breadcrumb with alternative breadcrumbs -->
            <ng-container *ngIf="breadcrumb.alternativeBreadcrumbs?.length">
              <button mat-button [matMenuTriggerFor]="menu">
                {{ breadcrumb.displayText | truncate : 25 }}
                <mat-icon>expand_more</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button
                  mat-menu-item
                  *ngFor="
                    let altBreadcrumb of breadcrumb.alternativeBreadcrumbs
                  "
                  [routerLink]="altBreadcrumb.navigationCommands"
                >
                  {{ altBreadcrumb.displayText | truncate : 25 }}
                </button>
              </mat-menu>
            </ng-container>

            <!-- Path separator symbol -->
            <div *ngIf="i < breadcrumbs.length - 1">&sol;</div>
          </div>
        </div>
        <mat-divider></mat-divider>
      </ng-container>
    </ng-container>
  `,
  styleUrls: ['./shared/styles/flex.scss', './shared/styles/spacing.scss'],
  styles: [],
})
export class BreadcrumbTrailComponent {
  breadcrumbs$: Observable<IBreadcrumb[]>;

  constructor(
    protected _router: Router,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    protected _projectService: ProjectService,
    protected _requirementService: RequirementService
  ) {
    this.breadcrumbs$ = this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event as NavigationEnd),
      map((event) => event.urlAfterRedirects),
      map((url) => url.split('?')[0]),
      map((url) => url.split('/').filter((s) => s.length > 0)),
      distinctUntilChanged(isEqual),
      switchMap((urlParts) => this._parseUrl(urlParts))
    );
  }

  protected _parseCatalogUrl(urlParts: string[]): Observable<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    if (!first) {
      return of([]);
    }

    const catalogId = Number(first);
    return this._catalogService.getCatalog(catalogId).pipe(
      map((catalog) => [
        {
          displayText: catalog.title,
          navigationCommands: ['catalogs', catalog.id, 'catalog-modules'],
        },
        {
          displayText: 'Catalog Modules',
          navigationCommands: ['catalogs', catalog.id, 'catalog-modules'],
        },
      ])
    );
  }

  protected _parseCatalogModuleUrl(
    urlParts: string[]
  ): Observable<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    if (!first) {
      return of([]);
    }

    const catalogModuleId = Number(first);
    return this._catalogModuleService.getCatalogModule(catalogModuleId).pipe(
      map((catalogModule) => [
        {
          displayText: catalogModule.catalog.title,
          navigationCommands: [
            'catalogs',
            catalogModule.catalog.id,
            'catalog-modules',
          ],
        },
        {
          displayText: catalogModule.title,
          navigationCommands: [
            'catalog-modules',
            catalogModule.id,
            'catalog-requirements',
          ],
        },
        {
          displayText: 'Catalog Requirements',
          navigationCommands: [
            'catalog-modules',
            catalogModule.id,
            'catalog-requirements',
          ],
        },
      ])
    );
  }

  protected _parseProjectUrl(urlParts: string[]): Observable<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    const second = urlParts.length > 1 ? urlParts[1] : null;
    if (!first || !second) {
      return of([]);
    }

    const projectId = Number(first);
    return this._projectService.getProject(projectId).pipe(
      map((project) => {
        const projectBreadcrumb = {
          displayText: project.name,
          navigationCommands: ['projects', project.id, 'requirements'],
        };
        const requirementsBreadcrumb = {
          displayText: 'Requirements',
          navigationCommands: ['projects', project.id, 'requirements'],
        };
        const documentsBreadcrumb = {
          displayText: 'Documents',
          navigationCommands: ['projects', project.id, 'documents'],
        };
        const projectMeasuresBreadcrumb = {
          displayText: 'Measures',
          navigationCommands: ['projects', project.id, 'measures'],
        };

        switch (second) {
          case 'requirements':
            return [
              projectBreadcrumb,
              {
                ...requirementsBreadcrumb,
                alternativeBreadcrumbs: [
                  projectMeasuresBreadcrumb,
                  documentsBreadcrumb,
                ],
              },
            ];
          case 'documents':
            return [
              projectBreadcrumb,
              {
                ...documentsBreadcrumb,
                alternativeBreadcrumbs: [
                  requirementsBreadcrumb,
                  projectMeasuresBreadcrumb,
                ],
              },
            ];
          case 'measures':
            return [
              projectBreadcrumb,
              {
                ...projectMeasuresBreadcrumb,
                alternativeBreadcrumbs: [
                  requirementsBreadcrumb,
                  documentsBreadcrumb,
                ],
              },
            ];
          default:
            return [];
        }
      })
    );
  }

  protected _parseRequirementUrl(
    urlParts: string[]
  ): Observable<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    if (!first) {
      return of([]);
    }

    const requirementId = Number(first);
    return this._requirementService.getRequirement(requirementId).pipe(
      map((requirement) => [
        {
          displayText: requirement.project.name,
          navigationCommands: [
            'projects',
            requirement.project.id,
            'requirements',
          ],
        },
        {
          displayText: requirement.summary,
          navigationCommands: ['requirements', requirement.id, 'measures'],
        },
        {
          displayText: 'Measures',
          navigationCommands: ['requirements', requirement.id, 'measures'],
        },
      ])
    );
  }

  protected _parseUrl(urlParts: string[]): Observable<IBreadcrumb[]> {
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
        return this._parseCatalogUrl(tail).pipe(
          map((breadcrumbs) => [allCatalogsBreadcrumb, ...breadcrumbs])
        );
      case 'catalog-modules':
        return this._parseCatalogModuleUrl(tail).pipe(
          map((breadcrumbs) => [allCatalogsBreadcrumb, ...breadcrumbs])
        );
      case 'projects':
        return this._parseProjectUrl(tail).pipe(
          map((breadcrumbs) => [allProjectsBreadcrumb, ...breadcrumbs])
        );
      case 'requirements':
        return this._parseRequirementUrl(tail).pipe(
          map((breadcrumbs) => [allProjectsBreadcrumb, ...breadcrumbs])
        );
      default:
        return of([]);
    }
  }
}
