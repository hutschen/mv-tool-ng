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

import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnInit,
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
import { Observable, of } from 'rxjs';

export interface ITableColumn<T> {
  id: string;
  optional: boolean;
  toValue?: (data: T) => any;
  toStr?: (data: T) => string;
  toBool?: (data: T) => boolean;
}

class TableColumn<T> implements ITableColumn<T> {
  id: string;
  optional: boolean;
  protected _toValue?: (data: T) => any;
  protected _toStr?: (data: T) => string;
  protected _toBool?: (data: T) => boolean;

  constructor(tableColumn: ITableColumn<T>) {
    this.id = tableColumn.id;
    this.optional = tableColumn.optional;
    this._toValue = tableColumn.toValue;
    this._toStr = tableColumn.toStr;
    this._toBool = tableColumn.toBool;
  }

  toValue(data: T): any {
    if (this._toValue) {
      return this._toValue(data);
    } else {
      return this.id in data ? data[this.id as keyof T] : null;
    }
  }

  toStr(data: T): string {
    return this._toStr ? this._toStr(data) : this.toValue(data).toString();
  }

  toBool(data: T): boolean {
    return this._toBool ? this._toBool(data) : !!this.toValue(data);
  }
}

class TableColumns<T> {
  protected _columns: TableColumn<T>[] = [];
  protected _columnMap: Map<string, TableColumn<T>>;

  constructor(columns: ITableColumn<T>[]) {
    this._columns = columns.map((c) => new TableColumn(c));
    this._columnMap = new Map(this._columns.map((c) => [c.id, c]));
  }

  columnIds(data: T[] = []): string[] {
    return this._columns
      .filter((c) => c.optional || data.some((d) => c.toBool(d)))
      .map((c) => c.id);
  }
}

function getColumnNames<T>(
  columns: ITableColumn<T>[],
  data: T[] = []
): string[] {
  return columns
    .filter(
      (column) =>
        !column.optional ||
        data.some((d) => (column.id in d ? d[column.id as keyof T] : false))
    )
    .map((c) => c.id);
}

@Component({
  selector: 'mvtool-table',
  template: `
    <div class="mat-elevation-z3 fx-column">
      <table mat-table [dataSource]="_dataSource">
        <ng-content></ng-content>
        <tr mat-header-row *matHeaderRowDef="columnIds; sticky: true"></tr>
        <tr
          mat-row
          [class.clickable-row]="rowClicked.observed"
          *matRowDef="let row; columns: columnIds"
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
            <div *ngIf="dataLoaded" class="fx-row fx-space-between-center">
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
            <div *ngIf="!dataLoaded" class="fx-row fx-gap-10">
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
  styleUrls: ['../styles/flex.css'],
  styles: [
    '.clickable-row { cursor: pointer; }',
    '.clickable-row:hover { background: rgba(0,0,0,0.04); }',
  ],
})
export class TableComponent<T>
  implements OnInit, AfterContentInit, AfterViewInit
{
  // see https://github.com/angular/components/tree/main/src/components-examples/material/table/table-wrapped

  @Input() data$: Observable<T[]> = of([] as T[]);
  @Input() columns: ITableColumn<T>[] = [];
  @Input() pageSize: number = 25;
  @Input() dataLoaded: boolean = true;
  @Input() noContentText: string = 'Nothing to display';
  @Input() loadingText: string = 'Loading...';
  @Input() createLabel: string = 'Create One';
  @Output() rowClicked = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();
  columnIds: string[] = [];
  protected _dataSource = new MatTableDataSource<T>();
  protected _filterValue: string = '';

  @ContentChildren(MatHeaderRowDef) headerRowDefs!: QueryList<MatHeaderRowDef>;
  @ContentChildren(MatRowDef) rowDefs!: QueryList<MatRowDef<T>>;
  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;
  // Comment out noDataRow because it's defined in the template and must not
  // be loaded from the content children
  // @ContentChild(MatNoDataRow) noDataRow: MatNoDataRow;
  @ViewChild(MatTable, { static: true }) table!: MatTable<T>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.columnIds = getColumnNames(this.columns);
    this.data$.subscribe((data) => {
      this._dataSource.data = data;
      this.columnIds = getColumnNames(this.columns, data);
    });
  }

  ngAfterContentInit(): void {
    this.columnDefs.forEach((columnDef) => this.table.addColumnDef(columnDef));
    this.rowDefs.forEach((rowDef) => this.table.addRowDef(rowDef));
    this.headerRowDefs.forEach((headerRowDef) =>
      this.table.addHeaderRowDef(headerRowDef)
    );
    // this.table?.setNoDataRow(this.noDataRow);
  }

  ngAfterViewInit(): void {
    this._dataSource.paginator = this.paginator;
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
