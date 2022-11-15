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

enum NavbarSelection {
  Projects,
  Catalogs,
}

@Component({
  selector: 'mvtool-app-navbar',
  template: `
    <div *ngIf="!hide" class="navbar">
      <!-- Button Catalog -->
      <button
        mat-button
        routerLink="/catalogs"
        [class.selected]="catalogsSelected"
      >
        Catalogs
      </button>
      <!-- Button Projects -->
      <button
        mat-button
        routerLink="/projects"
        [class.selected]="projectsSelected"
      >
        Projects
      </button>
    </div>
  `,
  styles: [
    '.navbar { padding-left: 10px; }',
    '.selected { background: rgba(0,0,0,.2); }',
    'button:hover { background: rgba(0,0,0,.4); }',
  ],
})
export class AppNavbarComponent implements OnInit {
  protected _selected: NavbarSelection | null = null;

  constructor(protected _router: Router) {}

  ngOnInit(): void {
    this._router.events.subscribe((event) => {
      const url = this._router.url.split('/').filter((s) => s.length > 0);
      this._handleUrl(url);
    });
  }

  get projectsSelected(): boolean {
    return this._selected === NavbarSelection.Projects;
  }

  get catalogsSelected(): boolean {
    return this._selected === NavbarSelection.Catalogs;
  }

  get hide(): boolean {
    return this._selected === null;
  }

  protected _handleUrl(url: string[]) {
    const entitySegment = url.length >= 1 ? url[0] : null;
    switch (entitySegment) {
      case 'catalogs':
        this._selected = NavbarSelection.Catalogs;
        break;
      case 'catalog-modules':
        this._selected = NavbarSelection.Catalogs;
        break;
      case 'projects':
        this._selected = NavbarSelection.Projects;
        break;
      case 'requirements':
        this._selected = NavbarSelection.Projects;
        break;
      default:
        this._selected = null;
        break;
    }
  }
}
