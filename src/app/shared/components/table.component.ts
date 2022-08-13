import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';

export interface ITableColumn {
  name: string;
  optional: boolean;
}

@Component({
  selector: 'mvtool-table',
  template: `
    <div fxLayout="column" class="mat-elevation-z3">
      <table mat-table [dataSource]="_dataSource">
        <ng-content></ng-content>
        <tr
          mat-header-row
          *matHeaderRowDef="displayedColumns; sticky: true"
        ></tr>
        <tr
          mat-row
          [class.clickable-row]="rowClicked.observed"
          *matRowDef="let row; columns: displayedColumns"
          (click)="rowClicked.emit(row)"
        ></tr>

        <tr class="mat-row" *matNoDataRow>
          <!-- Shown when there is no matching data -->
          <td *ngIf="filterValue" class="mat-cell" colspan="100">
            No data matching the filter:
            <strong>{{ filterValue }}</strong>
          </td>
          <!-- Shown when the table is empty -->
          <td *ngIf="!filterValue" class="mat-cell" colspan="100">
            <div
              *ngIf="dataLoaded"
              fxLayout="row"
              fxLayoutAlign="space-between center"
            >
              <div>{{ noContentText }}</div>
              <button
                *ngIf="create.observed"
                mat-raised-button
                (click)="create.emit()"
                color="accent"
              >
                <mat-icon>add</mat-icon>
                {{ createLabel }}
              </button>
            </div>
            <div *ngIf="!dataLoaded" fxLayout="row" fxLayoutGap="10px">
              <mat-spinner diameter="20"></mat-spinner>
              <div>{{ loadingText }}</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Table paginator -->
      <mat-paginator
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 25, 50, 100, 150]"
        showFirstLastButtons
      >
      </mat-paginator>
    </div>
  `,
  styles: [
    '.clickable-row { cursor: pointer; }',
    '.clickable-row:hover { background-color: #f5f5f5; }',
  ],
})
export class TableComponent<T> implements AfterContentInit, AfterViewInit {
  // see https://github.com/angular/components/tree/main/src/components-examples/material/table/table-wrapped

  @Input() columns: ITableColumn[] = [];
  @Input() pageSize: number = 25;
  @Input() dataLoaded: boolean = true;
  @Input() noContentText: string = 'Nothing to display';
  @Input() loadingText: string = 'Loading...';
  @Input() createLabel: string = 'Create One';
  @Output() rowClicked = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();
  protected _dataSource = new MatTableDataSource<T>();
  protected _filterValue: string = '';

  @ContentChildren(MatHeaderRowDef)
  headerRowDefs: QueryList<MatHeaderRowDef> | null = null;
  @ContentChildren(MatRowDef) rowDefs: QueryList<MatRowDef<T>> | null = null;
  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef> | null =
    null;
  // Comment out noDataRow because it's defined in the template and must not
  // be loaded from the content children
  // @ContentChild(MatNoDataRow) noDataRow: MatNoDataRow | null = null;
  @ViewChild(MatTable, { static: true }) table: MatTable<T> | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor() {}

  ngAfterContentInit(): void {
    this.columnDefs?.forEach((columnDef) =>
      this.table?.addColumnDef(columnDef)
    );
    this.rowDefs?.forEach((rowDef) => this.table?.addRowDef(rowDef));
    this.headerRowDefs?.forEach((headerRowDef) =>
      this.table?.addHeaderRowDef(headerRowDef)
    );
    // this.table?.setNoDataRow(this.noDataRow);
  }

  ngAfterViewInit(): void {
    this._dataSource.paginator = this.paginator;
  }

  @Input()
  set data(data: T[]) {
    this._dataSource.data = data;
  }

  get displayedColumns(): string[] {
    let displayFlags = new Map<string, boolean>();
    for (let column of this.columns) {
      displayFlags.set(column.name, !column.optional);
    }

    for (let row of this._dataSource.data) {
      for (let [key, value] of Object.entries(row)) {
        if (value && displayFlags.has(key)) {
          displayFlags.set(key, true);
        }
      }
    }
    let displayedColumns: string[] = [];

    for (let columnName of displayFlags.keys()) {
      if (displayFlags.get(columnName)) {
        displayedColumns.push(columnName);
      }
    }
    return displayedColumns;
  }

  @Input()
  set sort(sort: MatSort) {
    this._dataSource.sort = sort;
  }

  @Input()
  set filterValue(value: string) {
    this._filterValue = value;
    this._dataSource.filter = value;
  }

  get filterValue(): string {
    return this._filterValue;
  }
}
