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
import { CatalogModule, CatalogModuleService } from './catalog-module.service';
import { IInteraction, IInteractionService } from '../data/interaction';
import {
  Observable,
  Subject,
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { CatalogModuleDialogService } from 'src/app/catalog-module/catalog-module-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';
import { Catalog } from './catalog.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleInteractionService
  implements IInteractionService<CatalogModule>
{
  protected _interactionsSubject = new Subject<IInteraction<CatalogModule>>();
  readonly interactions$ = this._interactionsSubject.asObservable();

  constructor(
    protected _catalogModuleService: CatalogModuleService,
    protected _catalogModuleDialogService: CatalogModuleDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  syncCatalogModule(catalogModule: CatalogModule): Observable<CatalogModule> {
    return this.interactions$.pipe(
      filter((interaction) => interaction.item.id === catalogModule.id),
      map((interaction) => interaction.item),
      startWith(catalogModule)
    );
  }

  protected async _createOrEditCatalogModule(
    catalog: Catalog,
    catalogModule?: CatalogModule
  ): Promise<void> {
    const dialogRef = this._catalogModuleDialogService.openCatalogModuleDialog(
      catalog,
      catalogModule
    );
    const resultingCatalogModule = await firstValueFrom(
      dialogRef.afterClosed()
    );
    if (resultingCatalogModule) {
      this._interactionsSubject.next({
        item: resultingCatalogModule,
        action: catalogModule ? 'update' : 'add',
      });
    }
  }

  async onCreateCatalogModule(catalog: Catalog): Promise<void> {
    await this._createOrEditCatalogModule(catalog);
  }

  async onEditCatalogModule(catalogModule: CatalogModule): Promise<void> {
    await this._createOrEditCatalogModule(catalogModule.catalog, catalogModule);
  }

  async onDeleteCatalogModule(catalogModule: CatalogModule): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Catalog Module',
      `Do you really want to delete the catalog module "${catalogModule.title}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._catalogModuleService.deleteCatalogModule(catalogModule.id)
      );
      this._interactionsSubject.next({ item: catalogModule, action: 'delete' });
    }
  }
}
