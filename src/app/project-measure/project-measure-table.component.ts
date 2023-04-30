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
import { Observable, firstValueFrom } from 'rxjs';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { HideColumnsDialogService } from '../shared/components/hide-columns-dialog.component';
import { MeasureDataFrame } from '../shared/data/measure/measure-frame';
import { CatalogModuleService } from '../shared/services/catalog-module.service';
import { CatalogService } from '../shared/services/catalog.service';
import { DocumentService } from '../shared/services/document.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { MilestoneService } from '../shared/services/milestone.service';
import { Project } from '../shared/services/project.service';
import {
  IQueryParams,
  QueryParamsService,
} from '../shared/services/query-params.service';
import { RequirementService } from '../shared/services/requirement.service';
import { TargetObjectService } from '../shared/services/target-object.service';
import { combineQueryParams } from '../shared/combine-query-params';
import { DataSelection } from '../shared/data/selection';
import { MeasureInteractionService } from '../shared/services/measure-interaction.service';

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
  dataFrame!: MeasureDataFrame;
  marked!: DataSelection<Measure>;
  expanded!: DataSelection<Measure>;
  exportQueryParams$!: Observable<IQueryParams>;
  @Input() project!: Project;

  constructor(
    protected _queryParamsService: QueryParamsService,
    protected _measureService: MeasureService,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    protected _requirementService: RequirementService,
    protected _milestoneService: MilestoneService,
    protected _targetObjectService: TargetObjectService,
    protected _documentService: DocumentService,
    protected _downloadDialogService: DownloadDialogService,
    protected _hideColumnsDialogService: HideColumnsDialogService,
    readonly measureInteractions: MeasureInteractionService
  ) {}

  ngOnInit(): void {
    if (!this.project) throw new Error('project is undefined');
    const initialQueryParams = this._queryParamsService.getQueryParams();

    // Create data frame, marked and expanded selection
    this.dataFrame = new MeasureDataFrame(
      this._measureService,
      this._documentService,
      this.project,
      initialQueryParams,
      this._catalogService,
      this._catalogModuleService,
      this._requirementService,
      this._milestoneService,
      this._targetObjectService
    );
    this.marked = new DataSelection('_marked', true, initialQueryParams);
    this.expanded = new DataSelection('_expanded', false, initialQueryParams);

    // Sync interactions
    this.dataFrame.syncInteractions(this.measureInteractions);

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

  async onExportMeasures(): Promise<void> {
    if (this.project) {
      const dialogRef = this._downloadDialogService.openDownloadDialog(
        this._measureService.downloadMeasureExcel({
          project_ids: this.project.id,
          ...(await firstValueFrom(this.exportQueryParams$)),
        }),
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
