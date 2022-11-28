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
import { DownloadDialogService } from '../shared/components/download-dialog.component';
import { ITableColumn } from '../shared/components/table.component';
import { UploadDialogService } from '../shared/components/upload-dialog.component';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Requirement } from '../shared/services/requirement.service';
import { MeasureDialogService } from './measure-dialog.component';

@Component({
  selector: 'mvtool-measure-table',
  templateUrl: './measure-table.component.html',
  styleUrls: ['../shared/styles/mat-table.css', '../shared/styles/flex.css'],
  styles: [],
})
export class MeasureTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'summary', optional: false },
    { name: 'description', optional: true },
    { name: 'document', optional: true },
    { name: 'jira_issue', optional: false },
    { name: 'completed', optional: false },
    { name: 'options', optional: false },
  ];
  protected _dataSubject = new ReplaySubject<Measure[]>(1);
  data$: Observable<Measure[]> = this._dataSubject.asObservable();
  dataLoaded: boolean = false;
  @Input() requirement: Requirement | null = null;

  constructor(
    protected _measureService: MeasureService,
    protected _measureDialogService: MeasureDialogService,
    protected _downloadDialogService: DownloadDialogService,
    protected _uploadDialogService: UploadDialogService
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

  async onDeleteMeasure(measure: Measure): Promise<void> {
    await firstValueFrom(this._measureService.deleteMeasure(measure.id));
    await this.onReloadMeasures();
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
    }
  }
}
