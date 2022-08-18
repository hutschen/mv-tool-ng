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
import { MatDialog } from '@angular/material/dialog';
import {
  DownloadDialogComponent,
  IDownloadDialogData,
} from '../shared/components/download-dialog.component';
import { ITableColumn } from '../shared/components/table.component';
import { UploadDialogComponent } from '../shared/components/upload-dialog.component';
import { IJiraIssue } from '../shared/services/jira-issue.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Requirement } from '../shared/services/requirement.service';
import { IUploadState } from '../shared/services/upload.service';
import {
  IMeasureDialogData,
  MeasureDialogComponent,
} from './measure-dialog.component';

@Component({
  selector: 'mvtool-measure-table',
  templateUrl: './measure-table.component.html',
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
  data: Measure[] = [];
  dataLoaded: boolean = false;
  @Input() requirement: Requirement | null = null;

  constructor(
    protected _measureService: MeasureService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadMeasures();
    this.dataLoaded = true;
  }

  onCreateMeasure(): void {
    let dialogRef = this._dialog.open(MeasureDialogComponent, {
      width: '500px',
      data: {
        requirement: this.requirement,
        measure: null,
      } as IMeasureDialogData,
    });
    dialogRef.afterClosed().subscribe(async (measureInput) => {
      if (measureInput && this.requirement) {
        await this._measureService.createMeasure(
          this.requirement.id,
          measureInput
        );
        await this.onReloadMeasures();
      }
    });
  }

  onEditMeasure(measure: Measure): void {
    let dialogRef = this._dialog.open(MeasureDialogComponent, {
      width: '500px',
      data: { requirement: this.requirement, measure } as IMeasureDialogData,
    });
    dialogRef.afterClosed().subscribe(async (measureInput) => {
      if (measureInput) {
        await this._measureService.updateMeasure(measure.id, measureInput);
        await this.onReloadMeasures();
      }
    });
  }

  async onDeleteMeasure(measure: Measure): Promise<void> {
    await this._measureService.deleteMeasure(measure.id);
    await this.onReloadMeasures();
  }

  onExportMeasures() {
    if (this.requirement) {
      this._dialog.open(DownloadDialogComponent, {
        width: '500px',
        data: {
          download$: this._measureService.downloadMeasureExcel(
            this.requirement.id
          ),
          filename: `measures.xlsx`,
        } as IDownloadDialogData,
      });
    }
  }

  onImportMeasures() {
    if (this.requirement) {
      const requirementId = this.requirement.id;
      const dialogRef = this._dialog.open(UploadDialogComponent, {
        width: '500px',
        data: (file: File) => {
          return this._measureService.uploadMeasureExcel(requirementId, file);
        },
      });
      dialogRef.afterClosed().subscribe((uploadState: IUploadState | null) => {
        if (uploadState && uploadState.state == 'done') {
          this.onReloadMeasures();
        }
      });
    }
  }

  async onReloadMeasures() {
    if (this.requirement) {
      this.data = await this._measureService.listMeasures(this.requirement.id);
    }
  }
}
