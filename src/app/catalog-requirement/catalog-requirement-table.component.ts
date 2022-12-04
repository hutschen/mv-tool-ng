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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { TableColumns } from '../shared/components/table.component';
import { CatalogModule } from '../shared/services/catalog-module.service';
import {
  CatalogRequirement,
  CatalogRequirementService,
} from '../shared/services/catalog-requirement.service';
import { CatalogRequirementDialogService } from './catalog-requirement-dialog.component';

@Component({
  selector: 'mvtool-catalog-requirement-table',
  templateUrl: './catalog-requirement-table.component.html',
  styleUrls: [
    '../shared/styles/mat-table.css',
    '../shared/styles/flex.css',
    '../shared/styles/truncate.css',
  ],
  styles: ['.mat-column-gs_absicherung {text-align: center;}'],
})
export class CatalogRequirementTableComponent implements OnInit {
  columns = new TableColumns<CatalogRequirement>([
    { id: 'reference', optional: true },
    { id: 'gs_anforderung_reference', optional: true },
    { id: 'summary', optional: false },
    { id: 'description', optional: true },
    { id: 'gs_absicherung', optional: true },
    { id: 'gs_verantwortliche', optional: true },
    { id: 'options', optional: false },
  ]);
  protected _dataSubject = new ReplaySubject<CatalogRequirement[]>(1);
  data$: Observable<CatalogRequirement[]> = this._dataSubject.asObservable();
  data: CatalogRequirement[] = [];
  dataLoaded: boolean = false;
  @Input() catalogModule?: CatalogModule;
  @Output() catalogRequirementClicked = new EventEmitter<CatalogRequirement>();

  constructor(
    protected _catalogRequirementService: CatalogRequirementService,
    protected _catalogRequirementDialogService: CatalogRequirementDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadCatalogRequirements();
  }

  protected async _createOrEditCatalogRequirement(
    catalogRequirement?: CatalogRequirement
  ): Promise<void> {
    if (this.catalogModule) {
      const dialogRef =
        this._catalogRequirementDialogService.openCatalogRequirementDialog(
          this.catalogModule,
          catalogRequirement
        );
      const resultingCatalogRequirement = await firstValueFrom(
        dialogRef.afterClosed()
      );
      if (resultingCatalogRequirement) {
        await this.onReloadCatalogRequirements();
      }
    } else {
      throw new Error('catalog module is undefined');
    }
  }

  async onCreateCatalogRequirement(): Promise<void> {
    this._createOrEditCatalogRequirement();
  }

  async onEditCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Promise<void> {
    this._createOrEditCatalogRequirement(catalogRequirement);
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
      await this.onReloadCatalogRequirements();
    }
  }

  async onReloadCatalogRequirements(): Promise<void> {
    if (this.catalogModule) {
      const data = await firstValueFrom(
        this._catalogRequirementService.listCatalogRequirements(
          this.catalogModule.id
        )
      );
      this._dataSubject.next(data);
      this.dataLoaded = true;
    } else {
      throw new Error('catalog module is undefined');
    }
  }
}
