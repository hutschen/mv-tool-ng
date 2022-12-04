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
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { FilterDialogService } from '../shared/components/filter-dialog.component';
import { ITableColumn } from '../shared/components/table.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { Project } from '../shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { ComplianceDialogService } from './compliance-dialog.component';
import { RequirementDialogService } from './requirement-dialog.component';
import { RequirementImportDialogService } from './requirement-import-dialog.component';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styleUrls: [
    '../shared/styles/mat-table.css',
    '../shared/styles/flex.css',
    '../shared/styles/truncate.css',
  ],
  styles: ['.mat-column-gsAbsicherung {text-align: center;}'],
})
export class RequirementTableComponent implements OnInit {
  columns: ITableColumn<Requirement>[] = [
    { id: 'reference', label: 'Reference', optional: true },
    {
      id: 'gsAnforderungReference',
      label: 'GS Reference',
      optional: true,
      toValue: (r) => r.catalog_requirement?.gs_anforderung_reference,
    },
    {
      id: 'catalog_module',
      label: 'Catalog Module',
      optional: true,
      toValue: (r) => r.catalog_requirement?.catalog_module.title,
    },
    { id: 'summary', label: 'Summary', optional: false },
    { id: 'description', label: 'Description', optional: true },
    {
      id: 'gsAbsicherung',
      label: 'GS Absicherung',
      optional: true,
      toValue: (r) => r.catalog_requirement?.gs_absicherung,
    },
    {
      id: 'gsVerantwortliche',
      label: 'GS Verantwortliche',
      optional: true,
      toValue: (r) => r.catalog_requirement?.gs_verantwortliche,
    },
    { id: 'target_object', label: 'Target Object', optional: true },
    {
      id: 'compliance_status',
      label: 'Compliance',
      optional: false,
      group: 'special',
    },
    { id: 'compliance_comment', label: 'Compliance Comment', optional: true },
    { id: 'completion', label: 'Completion', optional: true, group: 'special' },
    { id: 'options', optional: false, group: 'special' },
  ];
  protected _dataSubject = new ReplaySubject<Requirement[]>(1);
  data$: Observable<Requirement[]> = this._dataSubject.asObservable();
  dataLoaded: boolean = false;
  @Input() project: Project | null = null;
  @Output() requirementClicked = new EventEmitter<Requirement>();

  constructor(
    protected _requirementService: RequirementService,
    protected _requirementDialogService: RequirementDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _requirementImportDialogService: RequirementImportDialogService,
    protected _filterDialogService: FilterDialogService<Requirement>,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadRequirements();
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
        await this.onReloadRequirements();
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
      await this.onReloadRequirements();
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
      await this.onReloadRequirements();
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
      await this.onReloadRequirements();
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
        await this.onReloadRequirements();
      }
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onFilterRequirements(): Promise<void> {
    const dialogRef = this._filterDialogService.openFilterDialog(
      'Filter Summary',
      'summary',
      this.data$
    );
    const filterOperator = await firstValueFrom(dialogRef.afterClosed());
  }

  async onReloadRequirements(): Promise<void> {
    if (this.project) {
      const data = await firstValueFrom(
        this._requirementService.listRequirements(this.project.id)
      );
      this._dataSubject.next(data);
      this.dataLoaded = true;
    } else {
      throw new Error('Project is undefined');
    }
  }
}
