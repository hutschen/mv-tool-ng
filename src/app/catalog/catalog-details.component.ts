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
import { Catalog } from '../shared/services/catalog.service';
import { CatalogInteractionService } from '../shared/services/catalog-interaction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mvtool-catalog-details',
  template: `
    <div
      *ngIf="catalog$ | async as catalog"
      class="fx-column fx-gap-15 margin-x margin-y"
    >
      <!-- Title -->
      <div class="fx-row fx-space-between-center fx-gap-5">
        <h1 class="truncate no-margin">{{ catalog.title }}</h1>
        <div class="fx-row fx-gap-5">
          <button
            mat-stroked-button
            (click)="catalogInteractions.onEditCatalog(catalog)"
          >
            <mat-icon>edit_note</mat-icon>
            Edit Catalog
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
export class CatalogDetailsComponent {
  catalog$?: Observable<Catalog>;

  constructor(readonly catalogInteractions: CatalogInteractionService) {}

  @Input()
  set catalog(catalog: Catalog) {
    this.catalog$ = this.catalogInteractions.syncCatalog(catalog);
  }
}
