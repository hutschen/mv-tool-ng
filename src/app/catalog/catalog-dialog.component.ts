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

import { Component, Inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable, finalize, firstValueFrom } from 'rxjs';
import {
  Catalog,
  CatalogService,
  ICatalogInput,
} from '../shared/services/catalog.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCatalogDialog(
    catalog?: Catalog
  ): MatDialogRef<CatalogDialogComponent, Catalog> {
    return this._dialog.open(CatalogDialogComponent, {
      width: '500px',
      data: catalog,
    });
  }
}

@Component({
  selector: 'mvtool-catalog-dialog',
  templateUrl: './catalog-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class CatalogDialogComponent {
  catalogInput: ICatalogInput = {
    reference: null,
    title: '',
    description: null,
  };
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<CatalogDialogComponent>,
    protected _catalogService: CatalogService,
    @Inject(MAT_DIALOG_DATA) protected _catalog?: Catalog
  ) {
    if (this._catalog) {
      this.catalogInput = this._catalog.toCatalogInput();
    }
  }

  get createMode(): boolean {
    return !this._catalog;
  }

  async onSave(form: NgForm) {
    if (form.valid) {
      // Define observable to create or update catalog
      let catalog$: Observable<Catalog>;
      if (!this._catalog) {
        catalog$ = this._catalogService.createCatalog(this.catalogInput);
      } else {
        catalog$ = this._catalogService.updateCatalog(
          this._catalog.id,
          this.catalogInput
        );
      }

      // Perform action and close dialog
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          catalog$.pipe(
            finalize(() => {
              this.isSaving = false;
              this._dialogRef.disableClose = false;
            })
          )
        )
      );
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
