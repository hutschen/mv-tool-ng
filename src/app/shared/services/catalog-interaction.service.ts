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
import { Interaction, InteractionService } from '../data/interaction';
import { Catalog, CatalogService } from './catalog.service';
import {
  Observable,
  Subject,
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { CatalogDialogService } from 'src/app/catalog/catalog-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CatalogInteractionService implements InteractionService<Catalog> {
  protected _interactionSubject = new Subject<Interaction<Catalog>>();
  readonly interactions$ = this._interactionSubject.asObservable();

  constructor(
    protected _catalogService: CatalogService,
    protected _catalogDialogService: CatalogDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  syncCatalog(catalog: Catalog): Observable<Catalog> {
    return this.interactions$.pipe(
      filter((interaction) => interaction.item.id === catalog.id),
      map((interaction) => interaction.item),
      startWith(catalog)
    );
  }

  protected async _createOrEditCatalog(catalog?: Catalog) {
    const dialogRef = this._catalogDialogService.openCatalogDialog(catalog);
    const resultingCatalog = await firstValueFrom(dialogRef.afterClosed());
    if (resultingCatalog) {
      this._interactionSubject.next({
        item: resultingCatalog,
        action: catalog ? 'update' : 'create',
      });
    }
  }

  async onCreateCatalog(): Promise<void> {
    await this._createOrEditCatalog();
  }

  async onEditCatalog(catalog: Catalog): Promise<void> {
    await this._createOrEditCatalog(catalog);
  }

  async onDeleteCatalog(catalog: Catalog): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Catalog',
      `Do you really want to delete the catalog "${catalog.title}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._catalogService.deleteCatalog(catalog.id));
      this._interactionSubject.next({ item: catalog, action: 'delete' });
    }
  }
}
