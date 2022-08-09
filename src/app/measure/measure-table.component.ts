import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IJiraIssue } from '../shared/services/jira-issue.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Requirement } from '../shared/services/requirement.service';
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
  displayedColumns: string[] = [
    'summary',
    'description',
    'document',
    'jira_issue',
    'completed',
    'options',
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

  onExportMeasures() {}
  onImportMeasures() {}

  async onReloadMeasures() {
    if (this.requirement) {
      this.data = await this._measureService.listMeasures(this.requirement.id);
    }
  }
}
