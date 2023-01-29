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

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  debounceTime,
  firstValueFrom,
  map,
  merge,
  startWith,
  switchMap,
} from 'rxjs';
import { ComplianceDialogService } from '../shared/components/compliance-dialog.component';
import { ConfirmDialogService } from '../shared/components/confirm-dialog.component';
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import {
  DataColumn,
  DataField,
  DataPage,
  PlaceholderField,
} from '../shared/data';
import {
  Measure,
  MeasureService,
  IMeasureQueryParams,
} from '../shared/services/measure.service';
import { Project } from '../shared/services/project.service';
import { Requirement } from '../shared/services/requirement.service';
import { CompletionDialogService } from './completion-dialog.component';
import { MeasureDialogService } from './measure-dialog.component';
import {
  DocumentField,
  JiraIssueField,
  StatusField,
  VerifiedField,
} from './measure-fields';
import { MeasureDataPage } from './measure-page';
import { VerificationDialogService } from './verification-dialog.component';

@Component({
  selector: 'mvtool-http-measure-table',
  templateUrl: './http-measure-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class HttpMeasureTableComponent implements AfterViewInit {
  @Input() requirement?: Requirement;
  @Input() project?: Project;

  dataFrame: MeasureDataPage;
  resultsLength = 0;
  isLoadingData = true;
  isRateLimitReached = false;
  searchStr?: string;
  reload = new EventEmitter<void>();
  search = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    protected _measureService: MeasureService,
    protected _measureDialogService: MeasureDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _completionDialogService: CompletionDialogService,
    protected _verificationDialogService: VerificationDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {
    this.dataFrame = new MeasureDataPage(this._measureService);
  }

  ngAfterViewInit(): void {
    // When the user changes the sort order, reset to the first page
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    // Load and reload table data
    const reload$ = merge(
      this.sort.sortChange,
      this.paginator.page,
      this.reload,
      this.search.pipe(debounceTime(500))
    ).pipe(startWith({}));

    // Load names of columns to set as non-optional
    const namesOfRequiredColumns = this.dataFrame.columns
      .filter((column) => !column.optional)
      .map((column) => column.name);
    reload$
      .pipe(
        switchMap(() => {
          return this._measureService.getMeasureFieldNames({
            project_ids: [this.project?.id ?? this.requirement!.project.id],
          });
        })
      )
      .subscribe((fieldNames) => {
        // set original required columns
        this.dataFrame.columns.forEach((column) => {
          column.optional = !namesOfRequiredColumns.includes(column.name);
        });

        // set required columns for current project
        this.dataFrame.columns
          .filter((column) => fieldNames.includes(column.name))
          .forEach((column) => (column.optional = false));
      });

    // Load table data
    reload$
      .pipe(
        switchMap(() => {
          this.isLoadingData = true;
          const queryParams: IMeasureQueryParams = {
            project_ids: this.project ? [this.project.id] : [],
            requirement_ids: this.requirement ? [this.requirement.id] : [],
          };
          if (this.searchStr) {
            queryParams.search = this.searchStr;
          }
          return this._measureService.getMeasuresPage(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.sort.active,
            this.sort.direction,
            queryParams
          );
        }),
        map((data) => {
          this.isLoadingData = false;
          this.resultsLength = data.total_count;
          return data.items;
        })
      )
      .subscribe((data) => (this.dataFrame.data = data));
  }

  protected async _createOrEditMeasure(measure?: Measure): Promise<void> {
    if (this.requirement) {
      const dialogRef = this._measureDialogService.openMeasureDialog(
        this.requirement,
        measure
      );
      const resultingMeasure = await firstValueFrom(dialogRef.afterClosed());
      if (resultingMeasure) {
        this.dataFrame.addOrUpdateItem(
          resultingMeasure,
          this.paginator.pageSize
        );
        this.onReloadMeasures();
      }
    } else {
      throw new Error('Requirement is undefined');
    }
  }

  onSearchMeasures(searchStr: string): void {
    this.searchStr = searchStr;
    this.search.emit(searchStr);
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
      this.dataFrame.updateItem(updatedMeasure as Measure);
      this.onReloadMeasures();
    }
  }

  async onEditCompletion(measure: Measure): Promise<void> {
    const dialogRef =
      this._completionDialogService.openCompletionDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this.dataFrame.updateItem(updatedMeasure as Measure);
      this.onReloadMeasures();
    }
  }

  async onEditVerification(measure: Measure): Promise<void> {
    const dialogRef =
      this._verificationDialogService.openVerificationDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this.dataFrame.updateItem(updatedMeasure as Measure);
      this.onReloadMeasures();
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
      this.onReloadMeasures();
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
      this.onReloadMeasures();
    }
  }

  onReloadMeasures(): void {
    this.reload.emit();
  }
}
