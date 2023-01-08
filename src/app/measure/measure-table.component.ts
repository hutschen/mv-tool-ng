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

import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { TableColumns } from '../shared/table-columns';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Requirement } from '../shared/services/requirement.service';
import { MeasureDialogService } from './measure-dialog.component';
import { VerificationDialogService } from './verification-dialog.component';
import { ComplianceDialogService } from '../shared/components/compliance-dialog.component';

@Component({
  selector: 'mvtool-measure-table',
  templateUrl: './measure-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class MeasureTableComponent implements OnInit {
  columns = new TableColumns<Measure>([
    { id: 'reference', label: 'Reference', optional: true },
    { id: 'summary', label: 'Summary' },
    { id: 'description', optional: true, label: 'Description' },
    {
      id: 'document',
      optional: true,
      label: 'Document',
      toValue: (m) => m.document?.title,
    },
    {
      id: 'jira_issue',
      label: 'Jira Issue',
      toStr: (m) => {
        if (m.jira_issue) {
          return m.jira_issue.key;
        } else if (m.jira_issue_id) {
          return 'No permission on Jira issue';
        } else {
          return 'No Jira issue assigned';
        }
      },
    },
    {
      id: 'compliance_status',
      label: 'Compliance',
      optional: true,
      toStr: (r) => (r.compliance_status ? r.compliance_status : 'Not set'),
    },
    { id: 'compliance_comment', label: 'Compliance Comment', optional: true },
    { id: 'verification_method', optional: true, label: 'Verification Method' },
    {
      id: 'verification_comment',
      optional: true,
      label: 'Verification Comment',
    },
    {
      id: 'verified',
      optional: true,
      label: 'Verified',
      toStr: (m) => (m.verified ? 'Completed' : 'Not completed'),
    },
    { id: 'options' },
  ]);
  protected _dataSubject = new ReplaySubject<Measure[]>(1);
  data$: Observable<Measure[]> = this._dataSubject.asObservable();
  dataLoaded: boolean = false;
  @Input() requirement: Requirement | null = null;

  constructor(
    protected _measureService: MeasureService,
    protected _measureDialogService: MeasureDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _verificationDialogService: VerificationDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadMeasures();
  }

  protected async _createOrEditMeasure(measure?: Measure): Promise<void> {
    if (this.requirement) {
      const dialogRef = this._measureDialogService.openMeasureDialog(
        this.requirement,
        measure
      );
      const resultingMeasure = await firstValueFrom(dialogRef.afterClosed());
      if (resultingMeasure) {
        await this.onReloadMeasures();
      }
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  async onCreateMeasure(): Promise<void> {
    await this._createOrEditMeasure();
  }

  async onEditMeasure(measure: Measure): Promise<void> {
    await this._createOrEditMeasure(measure);
  }

  async onEditCompliance(measure: Measure): Promise<void> {
    const dialogRef =
      this._complianceDialogService.openComplianceDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      await this.onReloadMeasures();
    }
  }

  async onEditVerification(measure: Measure): Promise<void> {
    const dialogRef =
      this._verificationDialogService.openVerificationDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      await this.onReloadMeasures();
    }
  }

  async onDeleteMeasure(measure: Measure): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Measure',
      `Do you really want to delete measure "${measure.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._measureService.deleteMeasure(measure.id));
      await this.onReloadMeasures();
    }
  }

  async onExportMeasures(): Promise<void> {
    if (this.requirement) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._measureService.downloadMeasureExcel(this.requirement.id),
        'measure.xlsx'
      );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  async onImportMeasures(): Promise<void> {
    const dialogRef = this._uploadDialogService.openUploadDialog(
      (file: File) => {
        if (this.requirement) {
          return this._measureService.uploadMeasureExcel(
            this.requirement.id,
            file
          );
        } else {
          throw new Error('Requirement is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state == 'done') {
      await this.onReloadMeasures();
    }
  }

  async onReloadMeasures(): Promise<void> {
    if (this.requirement) {
      const data = await firstValueFrom(
        this._measureService.listMeasures(this.requirement.id)
      );
      this._dataSubject.next(data);
      this.dataLoaded = true;
    } else {
      throw new Error('Requirement is undefined');
    }
  }
}
