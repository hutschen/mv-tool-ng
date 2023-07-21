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
import { finalize, firstValueFrom, Observable } from 'rxjs';
import { CatalogModule } from '../shared/services/catalog-module.service';
import {
  CatalogRequirement,
  CatalogRequirementService,
  ICatalogRequirementInput,
} from '../shared/services/catalog-requirement.service';

export interface ICatalogRequirementDialogData {
  catalogModule: CatalogModule;
  catalogRequirement?: CatalogRequirement;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogRequirementDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCatalogRequirementDialog(
    catalogModule: CatalogModule,
    catalogRequirement?: CatalogRequirement
  ): MatDialogRef<CatalogRequirementDialogComponent, CatalogRequirement> {
    return this._dialog.open(CatalogRequirementDialogComponent, {
      width: '500px',
      data: { catalogModule, catalogRequirement },
    });
  }
}

@Component({
  selector: 'mvtool-catalog-requirement-dialog',
  templateUrl: './catalog-requirement-dialog.component.html',
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['.description-input { min-height: 100px; }'],
})
export class CatalogRequirementDialogComponent {
  catalogModule: CatalogModule;
  catalogRequirementInput: ICatalogRequirementInput = {
    summary: '',
  };
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<CatalogRequirementDialogComponent>,
    protected _catalogRequirementService: CatalogRequirementService,
    @Inject(MAT_DIALOG_DATA)
    protected _dialogData: ICatalogRequirementDialogData
  ) {
    this.catalogModule = this._dialogData.catalogModule;
    if (this._dialogData.catalogRequirement) {
      this.catalogRequirementInput =
        this._dialogData.catalogRequirement.toCatalogRequirementInput();
    }
  }

  get createMode(): boolean {
    return !this._dialogData.catalogRequirement;
  }

  async onSave(form: NgForm): Promise<void> {
    if (form.valid) {
      // Define observable to create or update catalog requirement
      let catalogRequirement$: Observable<CatalogRequirement>;
      if (!this._dialogData.catalogRequirement) {
        catalogRequirement$ =
          this._catalogRequirementService.createCatalogRequirement(
            this.catalogModule.id,
            this.catalogRequirementInput
          );
      } else {
        catalogRequirement$ =
          this._catalogRequirementService.updateCatalogRequirement(
            this._dialogData.catalogRequirement.id,
            this.catalogRequirementInput
          );
      }

      // Close dialog and return catalog requirement
      this.isSaving = true;
      this._dialogRef.disableClose = true;

      this._dialogRef.close(
        await firstValueFrom(
          catalogRequirement$.pipe(
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
    this._dialogRef.close();
  }
}
