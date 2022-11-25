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
import { filter, firstValueFrom, map } from 'rxjs';
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
    <div *ngIf="breadcrumbs.length">
      <div class="fx-row">
        <div
          class="breadcrumb-trail"
          *ngFor="let breadcrumb of breadcrumbs; let i = index"
        >
          <div *ngIf="!breadcrumb.alternativeBreadcrumbs?.length">
            <button mat-button [routerLink]="breadcrumb.navigationCommands">
              {{ breadcrumb.displayText | truncate: 25 }}
            </button>
            <span *ngIf="i < breadcrumbs.length - 1">&sol;</span>
          </div>
          <div *ngIf="breadcrumb.alternativeBreadcrumbs?.length">
            <button mat-button [matMenuTriggerFor]="menu">
              {{ breadcrumb.displayText | truncate: 25 }}
              <mat-icon>expand_more</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button
                mat-menu-item
                *ngFor="let altBreadcrumb of breadcrumb.alternativeBreadcrumbs"
                [routerLink]="altBreadcrumb.navigationCommands"
              >
                {{ altBreadcrumb.displayText | truncate: 25 }}
              </button>
            </mat-menu>
          </div>
        </div>
      </div>
      <mat-divider></mat-divider>
    </div>
  `,
  styleUrls: ['./shared/styles/flex.css'],
  styles: ['.breadcrumb-trail { padding: 5px 2px; }'],
})
export class BreadcrumbTrailComponent {
  breadcrumbs: IBreadcrumb[] = [];

  constructor(
    protected _router: Router,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    protected _projectService: ProjectService,
    protected _requirementService: RequirementService
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
    const first = urlParts.length > 0 ? urlParts[0] : null;
    if (!first) {
      return [];
    }

    const catalogId = Number(first);
    return [
      {
        displayText: (
          await firstValueFrom(this._catalogService.getCatalog(catalogId))
        ).title,
        navigationCommands: ['catalogs', catalogId, 'catalog-modules'],
      },
      {
        displayText: 'Catalog Modules',
        navigationCommands: ['catalogs', catalogId, 'catalog-modules'],
      },
    ];
  }

  protected async _parseCatalogModuleUrl(
    urlParts: string[]
  ): Promise<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    if (!first) {
      return [];
    }

    const catalogModuleId = Number(first);
    const catalogModule = await firstValueFrom(
      this._catalogModuleService.getCatalogModule(catalogModuleId)
    );
    return [
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
    ];
  }

  protected async _parseProjectUrl(urlParts: string[]): Promise<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    const second = urlParts.length > 1 ? urlParts[1] : null;
    if (!first || !second) {
      return [];
    }

    const projectId = Number(first);
    const projectBreadcrumb = {
      displayText: (
        await firstValueFrom(this._projectService.getProject(projectId))
      ).name,
      navigationCommands: ['projects', projectId, 'requirements'],
    };
    const requirementsBreadcrumb = {
      displayText: 'Requirements',
      navigationCommands: ['projects', projectId, 'requirements'],
    };
    const documentsBreadcrumb = {
      displayText: 'Documents',
      navigationCommands: ['projects', projectId, 'documents'],
    };

    switch (second) {
      case 'requirements':
        return [
          projectBreadcrumb,
          {
            ...requirementsBreadcrumb,
            alternativeBreadcrumbs: [documentsBreadcrumb],
          },
        ];
      case 'documents':
        return [
          projectBreadcrumb,
          {
            ...documentsBreadcrumb,
            alternativeBreadcrumbs: [requirementsBreadcrumb],
          },
        ];
      default:
        return [];
    }
  }

  protected async _parseRequirementUrl(
    urlParts: string[]
  ): Promise<IBreadcrumb[]> {
    const first = urlParts.length > 0 ? urlParts[0] : null;
    if (!first) {
      return [];
    }

    const requirementId = Number(first);
    const requirement = await firstValueFrom(
      this._requirementService.getRequirement(requirementId)
    );
    return [
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
    ];
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
      case 'catalog-modules':
        return [
          allCatalogsBreadcrumb,
          ...(await this._parseCatalogModuleUrl(tail)),
        ];
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
