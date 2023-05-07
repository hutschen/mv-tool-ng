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
import { CatalogModule } from '../shared/services/catalog-module.service';
import { CatalogModuleInteractionService } from '../shared/services/catalog-module-interaction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mvtool-catalog-module-details',
  template: `
    <div
      class="fx-column fx-gap-15 margin-x margin-y"
      *ngIf="catalogModule$ | async as catalogModule"
    >
      <!-- Title -->
      <div class="fx-row fx-space-between-center fx-gap-5">
        <h1 class="truncate no-margin">{{ catalogModule.title }}</h1>
        <div class="fx-row fx-gap-5">
          <button
            mat-stroked-button
            (click)="
              catalogModuleInteractions.onEditCatalogModule(catalogModule)
            "
          >
            <mat-icon>edit_note</mat-icon>
            Edit Catalog Module
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: [
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
    '../shared/styles/spacing.scss',
  ],
  styles: [],
})
export class CatalogModuleDetailsComponent {
  catalogModule$?: Observable<CatalogModule>;

  constructor(
    readonly catalogModuleInteractions: CatalogModuleInteractionService
  ) {}

  @Input()
  set catalogModule(catalogModule: CatalogModule) {
    this.catalogModule$ =
      this.catalogModuleInteractions.syncCatalogModule(catalogModule);
  }
}
