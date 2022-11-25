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
  data: Measure[] = [];
  dataLoaded: boolean = false;
  @Input() requirement: Requirement | null = null;

  constructor(
    protected _measureService: MeasureService,
    protected _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.onReloadMeasures();
  }

  protected _openMeasureDialog(measure: Measure | null = null): void {
    let dialogRef = this._dialog.open(MeasureDialogComponent, {
      width: '500px',
      data: {
        requirement: this.requirement,
        measure: measure,
      } as IMeasureDialogData,
    });
    dialogRef.afterClosed().subscribe((measure: Measure | null) => {
      if (measure) {
        this.onReloadMeasures();
      }
    });
  }

  onCreateMeasure(): void {
    this._openMeasureDialog();
  }

  onEditMeasure(measure: Measure): void {
    this._openMeasureDialog(measure);
  }

  async onDeleteMeasure(measure: Measure): Promise<void> {
    this._measureService
      .deleteMeasure(measure.id)
      .subscribe(this.onReloadMeasures.bind(this));
  }

  onExportMeasures(): void {
    if (this.requirement) {
      this._dialog.open(DownloadDialogComponent, {
        width: '500px',
        data: {
          download$: this._measureService.downloadMeasureExcel(
            this.requirement.id
          ),
          filename: 'measures.xlsx',
        } as IDownloadDialogData,
      });
    }
  }

  onImportMeasures(): void {
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

  onReloadMeasures(): void {
    if (this.requirement) {
      this._measureService
        .listMeasures(this.requirement.id)
        .subscribe((measures) => {
          this.data = measures;
          this.dataLoaded = true;
        });
    }
  }
}
