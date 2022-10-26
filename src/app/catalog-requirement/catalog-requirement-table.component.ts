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
import { MatDialog } from '@angular/material/dialog';
import { ITableColumn } from '../shared/components/table.component';
import { CatalogModule } from '../shared/services/catalog-module.service';
import {
  CatalogRequirement,
  CatalogRequirementService,
} from '../shared/services/catalog-requirement.service';

@Component({
  selector: 'mvtool-catalog-requirement-table',
  templateUrl: './catalog-requirement-table.component.html',
  styles: [],
})
export class CatalogRequirementTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'reference', optional: true },
    { name: 'gs_anforderung_reference', optional: true },
    { name: 'summary', optional: false },
    { name: 'description', optional: true },
    { name: 'gs_absicherung', optional: true },
    { name: 'gs_verantwortliche', optional: true },
    { name: 'target_object', optional: true },
    { name: 'compliance_status', optional: false },
    { name: 'compliance_comment', optional: true },
    { name: 'options', optional: false },
  ];
  data: CatalogRequirement[] = [];
  dataLoaded: boolean = false;
  @Input() catalogModule?: CatalogModule;
  @Output() catalogRequirementClicked = new EventEmitter<CatalogRequirement>();

  constructor(
    protected _catalogRequirementService: CatalogRequirementService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadCatalogRequirements();
    this.dataLoaded = true;
  }

  onCreateCatalogRequirement(): void {
    // this.catalogRequirementClicked.emit(catalogRequirement);
  }

  onEditCatalogRequirement(catalogRequirement: CatalogRequirement): void {
    this.catalogRequirementClicked.emit(catalogRequirement);
  }

  async onDeleteCatalogRequirement(
    catalogRequirement: CatalogRequirement
  ): Promise<void> {
    await this._catalogRequirementService.deleteCatalogRequirement(
      catalogRequirement.id
    );
    await this.onReloadCatalogRequirements();
  }

  async onReloadCatalogRequirements(): Promise<void> {
    if (this.catalogModule) {
      this.data = await this._catalogRequirementService.listCatalogRequirements(
        this.catalogModule.id
      );
    }
  }
}
