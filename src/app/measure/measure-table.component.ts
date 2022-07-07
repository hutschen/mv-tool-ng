import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { MeasureDialogComponent } from './measure-dialog.component';

@Component({
  selector: 'mvtool-measure-table',
  templateUrl: './measure-table.component.html',
  styles: [
    '.data-row:hover { cursor: pointer; background-color: #f5f5f5; }',
  ]
})
export class MeasureTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['summary', 'description', 'options'];
  dataSource = new MatTableDataSource<Measure>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @Input() requirementId: number | null = null;
  @Output() measureClicked = new EventEmitter<Measure>()

  constructor(
    protected _measureService: MeasureService, 
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadMeasures()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onMeasureClicked(measure: Measure): void {
    this.measureClicked.emit(measure)
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

  onFilterMeasures(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onExportMeasures() {}
  onImportMeasures() {}

  async onReloadMeasures() {
    if(this.requirementId !== null) {
      this.dataSource.data = await this._measureService.listMeasures(
        this.requirementId)
    }
  }
}
