// Copyright (C) 2023 Helmar Hutschenreuter
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

import { Injectable } from '@angular/core';
import {
  CatalogRequirement,
  CatalogRequirementService,
} from './catalog-requirement.service';
import { Interaction, InteractionService } from '../data/interaction';
import {
  Observable,
  Subject,
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { CatalogModule } from './catalog-module.service';
import { CatalogRequirementDialogService } from 'src/app/catalog-requirement/catalog-requirement-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CatalogRequirementInteractionService
  implements InteractionService<CatalogRequirement>
{
  protected _interactionsSubject = new Subject<
    Interaction<CatalogRequirement>
  >();
  interactions$ = this._interactionsSubject.asObservable();

  constructor(
    protected _catalogRequirementService: CatalogRequirementService,
    protected _catalogRequirementDialogService: CatalogRequirementDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  syncCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Observable<CatalogRequirement> {
    return this.interactions$.pipe(
      filter((interaction) => interaction.item.id === catalogRequirement.id),
      map((interaction) => interaction.item),
      startWith(catalogRequirement)
    );
  }

  protected async _createOrEditCatalogRequirement(
    catalogModule: CatalogModule,
    catalogRequirement?: CatalogRequirement
  ): Promise<void> {
    const dialogRef =
      this._catalogRequirementDialogService.openCatalogRequirementDialog(
        catalogModule,
        catalogRequirement
      );
    const resultingCatalogRequirement = await firstValueFrom(
      dialogRef.afterClosed()
    );
    if (resultingCatalogRequirement) {
      this._interactionsSubject.next({
        item: resultingCatalogRequirement,
        action: catalogRequirement ? 'update' : 'create',
      });
    }
  }

  onCreateCatalogRequirement(catalogModule: CatalogModule): Promise<void> {
    return this._createOrEditCatalogRequirement(catalogModule);
  }

  onEditCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Promise<void> {
    return this._createOrEditCatalogRequirement(
      catalogRequirement.catalog_module,
      catalogRequirement
    );
  }

  async onDeleteCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Catalog Requirement',
      `Do you really want to delete the catalog requirement "${catalogRequirement.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._catalogRequirementService.deleteCatalogRequirement(
          catalogRequirement.id
        )
      );
      this._interactionsSubject.next({
        item: catalogRequirement,
        action: 'delete',
      });
    }
  }
}
