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

import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CompletionDialogService } from '../measure/completion-dialog.component';
import { MeasureDialogService } from '../measure/measure-dialog.component';
import { VerificationDialogService } from '../measure/verification-dialog.component';
import { ComplianceDialogService } from '../shared/components/compliance-dialog.component';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { MeasureDataFrame } from '../shared/data/measure/measure-frame';
import { CatalogService } from '../shared/services/catalog.service';
import { DocumentService } from '../shared/services/document.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Project } from '../shared/services/project.service';
import { QueryParamsService } from '../shared/services/query-params.service';

@Component({
  selector: 'mvtool-project-measure-table',
  templateUrl: './project-measure-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class ProjectMeasureTableComponent implements OnInit {
  @Input() project!: Project;
  dataFrame!: MeasureDataFrame;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _measureService: MeasureService,
    protected _catalogService: CatalogService,
    protected _documentService: DocumentService,
    protected _measureDialogService: MeasureDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _completionDialogService: CompletionDialogService,
    protected _verificationDialogService: VerificationDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _confirmDialogService: ConfirmDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService
  ) {}

  ngOnInit(): void {
    if (!this.project) throw new Error('project is undefined');
    this.dataFrame = new MeasureDataFrame(
      this._measureService,
      this._documentService,
      this.project,
      this._queryParamsService.getQueryParams(),
      this._catalogService
    );
    this._queryParamsService
      .syncQueryParams(this.dataFrame.queryParams$)
      .subscribe();
  }

  async onEditCompliance(measure: Measure): Promise<void> {
    const dialogRef =
      this._complianceDialogService.openComplianceDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this.dataFrame.updateItem(updatedMeasure as Measure);
    }
  }

  async onEditCompletion(measure: Measure): Promise<void> {
    const dialogRef =
      this._completionDialogService.openCompletionDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this.dataFrame.updateItem(updatedMeasure as Measure);
    }
  }

  async onEditVerification(measure: Measure): Promise<void> {
    const dialogRef =
      this._verificationDialogService.openVerificationDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this.dataFrame.updateItem(updatedMeasure as Measure);
    }
  }

  async onEditMeasure(measure: Measure): Promise<void> {
    if (this.project) {
      const dialogRef = this._measureDialogService.openMeasureDialog(
        measure.requirement, // TODO: this is a temporary hack, it is better when requirement is not required
        measure
      );
      const resultingMeasure = await firstValueFrom(dialogRef.afterClosed());
      if (resultingMeasure) {
        this.dataFrame.updateItem(resultingMeasure);
      }
    } else {
      throw new Error('Project is undefined');
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
      this.dataFrame.removeItem(measure);
    }
  }

  async onExportMeasures(): Promise<void> {
    if (this.project) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._measureService.downloadProjectMeasureExcel(this.project.id),
        'measure.xlsx'
      );
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  onHideColumns(): void {
    this._hideColumnsDialogService.openHideColumnsDialog(
      this.dataFrame.columns
    );
  }
}
