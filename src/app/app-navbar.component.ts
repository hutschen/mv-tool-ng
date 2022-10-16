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

@Component({
  selector: 'mvtool-app-navbar',
  template: `
    <!-- Button Catalog -->
    <button mat-button routerLink="/catalogs">Catalogs</button>
    <!-- Button Projects -->
    <button mat-button class="selected" routerLink="/projects">Projects</button>
  `,
  styles: [
    '.selected { background: rgba(0,0,0,.2); }',
    'button:hover { background: rgba(0,0,0,.4); }',
  ],
})
export class AppNavbarComponent implements OnInit {
  // TODO: Check current route and set selected class accordingly
  constructor() {}

  ngOnInit(): void {}
}
