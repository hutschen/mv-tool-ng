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

import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Catalog,
  CatalogService,
  ICatalogInput,
} from '../shared/services/catalog.service';

@Component({
  selector: 'mvtool-catalog-dialog',
  templateUrl: './catalog-dialog.component.html',
  styles: [],
})
export class CatalogDialogComponent {
  catalogInput: ICatalogInput = {
    reference: null,
    title: '',
    description: null,
  };

  constructor(
    protected _dialogRef: MatDialogRef<CatalogDialogComponent>,
    protected _catalogService: CatalogService,
    @Inject(MAT_DIALOG_DATA) protected _catalog: Catalog | null
  ) {
    if (this._catalog) {
      this.catalogInput = this._catalog.toCatalogInput();
    }
  }

  get createMode(): boolean {
    return !this._catalog;
  }

  async onSave(form: NgForm): Promise<void> {
    if (form.valid) {
      let catalog: Catalog;
      if (!this._catalog) {
        catalog = await this._catalogService.createCatalog(this.catalogInput);
      } else {
        catalog = await this._catalogService.updateCatalog(
          this._catalog.id,
          this.catalogInput
        );
      }
      this._dialogRef.close(catalog);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
