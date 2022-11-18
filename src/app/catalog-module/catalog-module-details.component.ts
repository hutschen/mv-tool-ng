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
import { MatDialog } from '@angular/material/dialog';
import { CatalogModule } from '../shared/services/catalog-module.service';
import {
  CatalogModuleDialogComponent,
  ICatalogModuleDialogData,
} from './catalog-module-dialog.component';

@Component({
  selector: 'mvtool-catalog-module-details',
  template: `
    <div class="details fx-column fx-gap-15" *ngIf="catalogModule">
      <!-- Title -->
      <div class="fx-row fx-space-between-center fx-gap-5">
        <h1 class="truncate">{{ catalogModule.title }}</h1>
        <div class="fx-row fx-gap-5">
          <button mat-stroked-button (click)="onEditCatalogModule()">
            <mat-icon>edit_note</mat-icon>
            Edit Catalog Module
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.css'],
  styles: ['h1 { margin: 0; }', '.details { margin: 20px; }'],
})
export class CatalogModuleDetailsComponent {
  @Input() catalogModule?: CatalogModule;

  constructor(protected _dialog: MatDialog) {}

  onEditCatalogModule(): void {
    const dialogRef = this._dialog.open(CatalogModuleDialogComponent, {
      width: '500px',
      data: {
        catalog: this.catalogModule?.catalog,
        catalogModule: this.catalogModule,
      } as ICatalogModuleDialogData,
    });
    dialogRef.afterClosed().subscribe((catalogModule: CatalogModule | null) => {
      if (catalogModule) {
        this.catalogModule = catalogModule;
      }
    });
  }
}
