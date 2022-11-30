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
import { firstValueFrom, Observable } from 'rxjs';
import {
  CatalogModule,
  CatalogModuleService,
  ICatalogModuleInput,
} from '../shared/services/catalog-module.service';
import { Catalog } from '../shared/services/catalog.service';

export interface ICatalogModuleDialogData {
  catalog: Catalog;
  catalogModule?: CatalogModule;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCatalogModuleDialog(
    catalog: Catalog,
    catalogModule?: CatalogModule
  ): MatDialogRef<CatalogModuleDialogComponent, CatalogModule> {
    return this._dialog.open(CatalogModuleDialogComponent, {
      width: '500px',
      data: { catalog, catalogModule },
    });
  }
}

@Component({
  selector: 'mvtool-catalog-module-dialog',
  templateUrl: './catalog-module-dialog.component.html',
  styleUrls: ['../shared/styles/flex.css'],
  styles: ['textarea { min-height: 100px; }'],
})
export class CatalogModuleDialogComponent {
  catalog: Catalog;
  catalogModuleInput: ICatalogModuleInput = {
    reference: null,
    title: '',
    description: null,
    gs_reference: null,
  };

  constructor(
    protected _dialogRef: MatDialogRef<CatalogModuleDialogComponent>,
    protected _catalogModuleService: CatalogModuleService,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: ICatalogModuleDialogData
  ) {
    this.catalog = this._dialogData.catalog;
    if (this._dialogData.catalogModule) {
      this.catalogModuleInput =
        this._dialogData.catalogModule.toCatalogModuleInput();
    }
  }

  get createMode(): boolean {
    return !this._dialogData.catalogModule;
  }

  async onSave(form: NgForm): Promise<void> {
    if (form.valid) {
      let catalogModule$: Observable<CatalogModule>;
      if (!this._dialogData.catalogModule) {
        catalogModule$ = this._catalogModuleService.createCatalogModule(
          this.catalog.id,
          this.catalogModuleInput
        );
      } else {
        catalogModule$ = this._catalogModuleService.updateCatalogModule(
          this._dialogData.catalogModule.id,
          this.catalogModuleInput
        );
      }
      this._dialogRef.close(await firstValueFrom(catalogModule$));
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
