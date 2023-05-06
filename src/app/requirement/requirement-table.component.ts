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
import { Observable, firstValueFrom } from 'rxjs';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { Project } from '../shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { RequirementImportDialogService } from './requirement-import-dialog.component';
import { RequirementDataFrame } from '../shared/data/requirement/requirement-frame';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { CatalogService } from '../shared/services/catalog.service';
import { CatalogModuleService } from '../shared/services/catalog-module.service';
import { TargetObjectService } from '../shared/services/target-object.service';
import { MilestoneService } from '../shared/services/milestone.service';
import { DataSelection } from '../shared/data/selection';
import { combineQueryParams } from '../shared/combine-query-params';
import { RequirementInteractionService } from '../shared/services/requirement-interaction.service';
import { ExportDatasetDialogService } from '../shared/components/export-dataset-dialog.component';

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
  marked!: DataSelection<Requirement>;
  expanded!: DataSelection<Requirement>;
  exportQueryParams$!: Observable<IQueryParams>;
  @Input() project!: Project;
  @Output() clickRequirement = new EventEmitter<Requirement>();

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _requirementService: RequirementService,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    protected _milestoneService: MilestoneService,
    protected _targetObjectService: TargetObjectService,
    protected _exportDatasetDialogService: ExportDatasetDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _requirementImportDialogService: RequirementImportDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    readonly requirementInteractions: RequirementInteractionService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.project) throw new Error('Project is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new RequirementDataFrame(
      this._requirementService,
      this._catalogService,
      this._catalogModuleService,
      this._milestoneService,
      this._targetObjectService,
      this.project,
      initialQueryParams
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.requirementInteractions);

    // Sync query params with query params service
    const syncQueryParams$ = combineQueryParams([
      this.dataFrame.queryParams$,
      this.marked.queryParams$,
      this.expanded.queryParams$,
    ]);
    this._queryParamsService.syncQueryParams(syncQueryParams$).subscribe();

    // Define export query params
    this.exportQueryParams$ = combineQueryParams([
      this.dataFrame.search.queryParams$,
      this.dataFrame.columns.filterQueryParams$,
      this.dataFrame.sort.queryParams$,
    ]);
  }

  async onExportRequirementsDataset() {
    if (this.project) {
      const dialogRef =
        this._exportDatasetDialogService.openExportDatasetDialog({
          downloadDataset:
            this._requirementService.downloadRequirementsExcel.bind(
              this._requirementService
            ),
          getColumnNames:
            this._requirementService.getRequirementsExcelColumnNames.bind(
              this._requirementService
            ),
        });
      await firstValueFrom(dialogRef.afterClosed());
    } else {
      throw new Error('Project is undefined');
    }
  }

  async onExportRequirementsExcel(): Promise<void> {
    if (this.project) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._requirementService.downloadRequirementsExcel({
          project_ids: this.project.id,
          ...(await firstValueFrom(this.exportQueryParams$)),
        }),
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
          return this._requirementService.uploadRequirementsExcel(file, {
            fallback_project_id: this.project.id,
          });
        } else {
          throw new Error('Project is undefined');
        }
      }
    );
    const uploadState = await firstValueFrom(dialogRef.afterClosed());
    if (uploadState && uploadState.state === 'done') {
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
