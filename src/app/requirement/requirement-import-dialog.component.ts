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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogModuleService } from '../shared/services/catalog-module.service';
import { CatalogService } from '../shared/services/catalog.service';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-requirement-import-dialog',
  template: ` <p>requirement-import-dialog works!</p> `,
  styles: [],
})
export class RequirementImportDialogComponent implements OnInit {
  constructor(
    protected _dialogRef: MatDialogRef<RequirementImportDialogComponent>,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    @Inject(MAT_DIALOG_DATA) protected _project: Project
  ) {}

  // load catalogs and catalog modules
  async ngOnInit(): Promise<void> {}

  onCancel(): void {
    this._dialogRef.close();
  }
}
