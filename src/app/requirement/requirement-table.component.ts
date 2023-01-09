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

import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { TableColumns } from '../shared/table-columns';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { Project } from '../shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { ComplianceDialogService } from '../shared/components/compliance-dialog.component';
import { RequirementDialogService } from './requirement-dialog.component';
import { RequirementImportDialogService } from './requirement-import-dialog.component';

// FIXME: This service is only a temporary, quick and dirty solution to increase the loading speed.
@Injectable({
  providedIn: 'root',
})
export class RequirementCachingService {
  protected _cache = new Map<number, BehaviorSubject<Requirement[]>>();

  getSubject(projectId: number): BehaviorSubject<Requirement[]> {
    let subject = this._cache.get(projectId);
    if (!subject) {
      subject = new BehaviorSubject<Requirement[]>([]);
      this._cache.set(projectId, subject);
    }
    return subject;
  }

  createOrUpdateRequirement(projectId: number, requirement: Requirement) {
    const subject = this.getSubject(projectId);
    const requirements = subject.getValue();
    if (requirements) {
      const index = requirements.findIndex((r) => r.id === requirement.id);
      if (index >= 0) {
        requirements[index] = requirement;
      } else {
        requirements.push(requirement);
      }
      subject.next(requirements);
    }
  }

  deleteRequirement(projectId: number, requirement: Requirement) {
    const subject = this.getSubject(projectId);
    const requirements = subject.getValue();
    if (requirements) {
      const index = requirements.findIndex((r) => r.id === requirement.id);
      if (index >= 0) {
        requirements.splice(index, 1);
        subject.next(requirements);
      }
    }
  }
}

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
  columns = new TableColumns<Requirement>([
    { id: 'reference', label: 'Reference', optional: true },
    {
      id: 'gs_anforderung_reference',
      label: 'GS Reference',
      optional: true,
      toValue: (r) => r.catalog_requirement?.gs_anforderung_reference,
    },
    {
      id: 'catalog',
      label: 'Catalog',
      optional: true,
      toValue: (r) => r.catalog_requirement?.catalog_module.catalog,
      toStr: (r) => r.catalog_requirement?.catalog_module.catalog.title ?? '',
    },
    {
      id: 'catalog_module',
      label: 'Catalog Module',
      optional: true,
      toValue: (r) => r.catalog_requirement?.catalog_module,
      toStr: (r) => r.catalog_requirement?.catalog_module.title ?? '',
    },
    { id: 'summary', label: 'Summary' },
    { id: 'description', label: 'Description', optional: true },
    {
      id: 'gs_absicherung',
      label: 'GS Absicherung',
      optional: true,
      toValue: (r) => r.catalog_requirement?.gs_absicherung,
    },
    {
      id: 'gs_verantwortliche',
      label: 'GS Verantwortliche',
      optional: true,
      toValue: (r) => r.catalog_requirement?.gs_verantwortliche,
    },
    { id: 'milestone', label: 'Milestone', optional: true },
    { id: 'target_object', label: 'Target Object', optional: true },
    {
      id: 'compliance_status',
      label: 'Compliance',
      optional: true,
      toStr: (r) => (r.compliance_status ? r.compliance_status : 'Not set'),
    },
    { id: 'compliance_comment', label: 'Compliance Comment', optional: true },
    {
      id: 'completion',
      label: 'Completion',
      optional: true,
      toValue: (r) => r.percentComplete,
      toStr: (r) =>
        r.percentComplete !== null
          ? `${r.percentComplete}% complete`
          : 'Nothing to be completed',
      toBool: (r) => r.percentComplete !== null,
    },
    {
      id: 'alert',
      label: 'Alert',
      optional: true,
      toValue: (r) =>
        !!(
          r.compliance_status &&
          r.compliance_status_hint !== r.compliance_status
        ),
      toStr: (r) =>
        !!(
          r.compliance_status &&
          r.compliance_status_hint !== r.compliance_status
        )
          ? `Compliance status should be ${r.compliance_status_hint}.`
          : '',
    },
    { id: 'options' },
  ]);
  protected _dataSubject!: BehaviorSubject<Requirement[]>;
  data$!: Observable<Requirement[]>;
  dataLoaded: boolean = false;
  @Input() project?: Project;
  @Output() requirementClicked = new EventEmitter<Requirement>();

  constructor(
    protected _requirementService: RequirementService,
    protected _requirementCachingService: RequirementCachingService,
    protected _requirementDialogService: RequirementDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _requirementImportDialogService: RequirementImportDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.project) {
      this._dataSubject = this._requirementCachingService.getSubject(
        this.project.id
      );
      this.data$ = this._dataSubject.asObservable();
      await this.onReloadRequirements();
    } else {
      throw new Error('Project is undefined');
    }
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
        this._requirementCachingService.createOrUpdateRequirement(
          this.project.id,
          resultingRequirement
        );
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
    if (updatedRequirement && this.project) {
      this._requirementCachingService.createOrUpdateRequirement(
        this.project.id,
        updatedRequirement as Requirement
      );
    }
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Requirement',
      `Do you really want to delete requirement "${requirement.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed && this.project) {
      await firstValueFrom(
        this._requirementService.deleteRequirement(requirement.id)
      );
      this._requirementCachingService.deleteRequirement(
        this.project.id,
        requirement
      );
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
