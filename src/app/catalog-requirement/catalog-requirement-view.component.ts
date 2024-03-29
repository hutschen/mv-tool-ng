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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, firstValueFrom } from 'rxjs';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';

@Component({
  selector: 'mvtool-catalog-requirement-view',
  template: `
    <div *ngIf="catalogModule" class="fx-column">
      <mvtool-catalog-module-details
        [catalogModule]="catalogModule"
      ></mvtool-catalog-module-details>
      <mat-divider></mat-divider>
      <mvtool-catalog-requirement-table
        [catalogModule]="catalogModule"
      ></mvtool-catalog-requirement-table>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [],
})
export class CatalogRequirementViewComponent implements OnInit {
  catalogModule?: CatalogModule;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _catalogModuleService: CatalogModuleService
  ) {}

  ngOnInit() {
    const catalogModuleId = Number(
      this._route.snapshot.paramMap.get('catalogModuleId')
    );
    this._catalogModuleService
      .getCatalogModule(catalogModuleId)
      .pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._router.navigate(['/']);
            return EMPTY;
          }
          throw error;
        })
      )
      .subscribe((catalogModule) => (this.catalogModule = catalogModule));
  }
}
