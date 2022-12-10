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
import {
  combineLatest,
  firstValueFrom,
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import { FilterDialogService } from './filter-dialog.component';

export interface ITableColumn<T> {
  id: string;
  optional?: boolean;
  label?: string;
  auto?: boolean;
  group?: number | string;
  filterable?: boolean;
  filters?: string[];
  toValue?: (data: T) => any;
  toStr?: (data: T) => string;
  toBool?: (data: T) => boolean;
}

export class TableColumn<T> implements ITableColumn<T> {
  id: string;
  optional: boolean;
  label: string;
  auto: boolean;
  group?: number | string;
  filterable: boolean;
  filters: string[];
  protected _toValue?: (data: T) => any;
  protected _toStr?: (data: T) => string;
  protected _toBool?: (data: T) => boolean;

  constructor(tableColumn: ITableColumn<T>) {
    this.id = tableColumn.id;
    this.optional = tableColumn.optional ?? false;
    this.label = tableColumn.label ?? this.id;
    this.auto = tableColumn.auto ?? false;
    this.group = tableColumn.group;
    this.filterable = tableColumn.filterable ?? true;
    this.filters = tableColumn.filters ?? [];
    this._toValue = tableColumn.toValue;
    this._toStr = tableColumn.toStr;
    this._toBool = tableColumn.toBool;
  }

  filter(data: T): boolean {
    if (!this.filterable) {
      return true;
    }
    if (this.filters.length === 0) {
      return true;
    }
    return this.filters.includes(this.toStr(data));
  }

  toValue(data: T): any {
    if (this._toValue) {
      return this._toValue(data);
    } else {
      return this.id in data ? data[this.id as keyof T] : null;
    }
  }

  toStr(data: T): string {
    return this._toStr ? this._toStr(data) : String(this.toValue(data));
  }

  toBool(data: T): boolean {
    return this._toBool ? this._toBool(data) : !!this.toValue(data);
  }
}

export class TableColumns<T> {
  protected _columns: TableColumn<T>[] = [];
  protected _columnMap: Map<string, TableColumn<T>>;

  constructor(columns: ITableColumn<T>[]) {
    this._columns = columns.map((c) => new TableColumn(c));
    this._columnMap = new Map(this._columns.map((c) => [c.id, c]));
  }

  filter(data: T[]): T[] {
    return data.filter((d) => this._columns.every((c) => c.filter(d)));
  }

  getColumn(id: string): TableColumn<T> {
    const column = this._columnMap.get(id);
    if (!column) {
      throw new Error(`Column "${id}" not found`);
    }
    return column;
  }

  columnsToShow(data: T[] = []): TableColumn<T>[] {
    return this._columns.filter(
      (c) => !c.optional || data.some((d) => c.toBool(d))
    );
  }

  columnsByGroup(group?: number | string): TableColumn<T>[] {
    return this._columns.filter((c) => c.group === group);
  }

  columnsToAutoCreate(): TableColumn<T>[] {
    return this._columns.filter((c) => c.auto);
  }
}

@Component({
  selector: 'mvtool-table',
  templateUrl: './table.component.html',
  styleUrls: [
    '../styles/mat-table.css',
    '../styles/flex.css',
    '../styles/truncate.css',
  ],
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
  @Input() columns = new TableColumns<T>([]);
  @Input() pageSize: number = 25;
  @Input() dataLoaded: boolean = true;
  @Input() noContentText: string = 'Nothing to display';
  @Input() loadingText: string = 'Loading...';
  @Input() createLabel: string = 'Create One';
  @Output() rowClicked = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();
  protected _columnsSubject = new ReplaySubject<TableColumns<T>>(1);
  protected _columns$ = this._columnsSubject.asObservable();
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

  constructor(protected _filterDialogService: FilterDialogService<T>) {}

  ngOnInit(): void {
    this.columnIds = this.columns.columnsToShow().map((c) => c.id);
    this._columnsSubject.next(this.columns);
    combineLatest([this._columns$, this.data$]).subscribe(([columns, data]) => {
      this.columnIds = columns.columnsToShow(data).map((c) => c.id);
      this._dataSource.data = columns.filter(data);
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

  async onSetFilter(column: TableColumn<T>): Promise<void> {
    const dialogRef = this._filterDialogService.openFilterDialog(
      column,
      this._dataSource.data
    );
    const filters = await firstValueFrom(dialogRef.afterClosed());
    if (filters) {
      column.filters = filters;
    } else {
      column.filters = [];
    }
    this._columnsSubject.next(this.columns);
  }
}
