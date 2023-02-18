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
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { Project } from '../shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { ComplianceDialogService } from '../shared/components/compliance-dialog.component';
import { RequirementDialogService } from './requirement-dialog.component';
import { RequirementImportDialogService } from './requirement-import-dialog.component';
import { RequirementDataFrame } from '../shared/data/requirement/requirement-frame';
import { QueryParamsService } from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogService } from '../shared/services/catalog.service';
import { CatalogModuleService } from '../shared/services/catalog-module.service';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
})
export class RequirementTableComponent implements OnInit {
  dataFrame!: RequirementDataFrame;
  @Input() project?: Project;
  @Output() clickRequirement = new EventEmitter<Requirement>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _requirementService: RequirementService,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    protected _requirementDialogService: RequirementDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _requirementImportDialogService: RequirementImportDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.project) throw new Error('Project is undefined');
    this.dataFrame = new RequirementDataFrame(
      this._requirementService,
      this._catalogService,
      this._catalogModuleService,
      this.project,
      this._queryParamsService.getQueryParams()
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
  }

  protected async _createOrEditRequirement(
    requirement?: Requirement
  ): Promise<void> {
    if (this.project) {
      const dialogRef = this._requirementDialogService.openRequirementDialog(
        this.project,
        requirement
      );
      const resultingRequirement = await firstValueFrom(
        dialogRef.afterClosed()
      );
      if (resultingRequirement) {
        this.dataFrame.addOrUpdateItem(resultingRequirement);
      }
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onCreateRequirement(): Promise<void> {
    await this._createOrEditRequirement();
  }

  async onEditRequirement(requirement: Requirement): Promise<void> {
    await this._createOrEditRequirement(requirement);
  }

  async onEditCompliance(requirement: Requirement): Promise<void> {
    const dialogRef =
      this._complianceDialogService.openComplianceDialog(requirement);
    const updatedRequirement = await firstValueFrom(dialogRef.afterClosed());
    if (updatedRequirement) {
      this.dataFrame.updateItem(updatedRequirement as Requirement);
    }
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Requirement',
      `Do you really want to delete requirement "${requirement.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._requirementService.deleteRequirement(requirement.id)
      );
      this.dataFrame.removeItem(requirement);
    }
  }

  async onExportRequirementsExcel(): Promise<void> {
    if (this.project) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._requirementService.downloadRequirementsExcel(this.project.id),
        'requirements.xlsx'
      );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onImportRequirementsExcel(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.project) {
          return this._requirementService.uploadRequirementsExcel(
            this.project.id,
            file
          );
        } else {
          throw new Error('Project is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state == 'done') {
      this.dataFrame.reload();
    }
  }

  async onImportFromCatalog(): Promise<void> {
    if (this.project) {
      const dialogRef =
        this._requirementImportDialogService.openRequirementImportDialog(
          this.project
        );
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (result) {
        this.dataFrame.reload();
      }
    } else {
      throw new Error('Project is undefined');
    }
  }

  onHideColumns(): void {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
