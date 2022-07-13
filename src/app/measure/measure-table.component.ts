import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IJiraIssue } from '../shared/services/jira-issue.service';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { MeasureDialogComponent } from './measure-dialog.component';

@Component({
  selector: 'mvtool-measure-table',
  templateUrl: './measure-table.component.html',
  styles: []
})
export class MeasureTableComponent implements OnInit {
  displayedColumns: string[] = [
    'summary', 'description', 'document', 'jira_issue', 'completed', 'options'];
  data: Measure[] = [];
  dataLoaded: boolean = false
  @Input() requirementId: number | null = null;

  constructor(
    protected _measureService: MeasureService, 
    protected _dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadMeasures()
    this.dataLoaded = true
  }

  onCreateMeasure(): void {
    let dialogRef = this._dialog.open(MeasureDialogComponent, {
      width: '500px',
      data: { requirementId: this.requirementId, measure: null }
    })
    dialogRef.afterClosed().subscribe(async measureInput => {
      if (measureInput && this.requirementId !== null) {
        await this._measureService.createMeasure(
          this.requirementId, measureInput)
        this.onReloadMeasures()
      }
    })
  }

  onEditMeasure(measure: Measure): void {
    let dialogRef = this._dialog.open(MeasureDialogComponent, {
      width: '500px',
      data: { requirementId: this.requirementId, measure }
    })
    dialogRef.afterClosed().subscribe(async measureInput => {
      if (measureInput && this.requirementId !== null) {
        await this._measureService.updateMeasure(
          measure.id, measureInput)
        this.onReloadMeasures()
      }
    })
  }

  async onDeleteMeasure(measure: Measure): Promise<void> {
    await this._measureService.deleteMeasure(measure.id)
    this.onReloadMeasures()
  }

  async onJiraIssueCreated(jiraIssue: IJiraIssue, measure: Measure): Promise<void> {
    const measureInput = measure.toMeasureInput()
    measureInput.jira_issue_id = jiraIssue.id
    await this._measureService.updateMeasure(measure.id, measureInput)
    this.onReloadMeasures()
  }

  onExportMeasures() {}
  onImportMeasures() {}

  async onReloadMeasures() {
    if(this.requirementId !== null) {
      this.data = await this._measureService.listMeasures(this.requirementId)
    }
  }
}
