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
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatColumnDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { ITableRow, TableColumn, TableColumns } from '../table-columns';
import { FilterDialogService } from './filter-dialog.component';
import { ShowHideDialogService } from './show-hide-dialog.component';

@Component({
  selector: 'mvtool-table',
  templateUrl: './table.component.html',
  styleUrls: [
    '../styles/table.css',
    '../styles/flex.css',
    '../styles/truncate.css',
  ],
  styles: [
    '.clickable-row { cursor: pointer; }',
    '.clickable-row:hover { background: rgba(0,0,0,0.04); }',
  ],
})
export class TableComponent<T extends object>
  implements AfterContentInit, AfterViewInit
{
  protected _columnsSubject = new ReplaySubject<TableColumns<T>>(1);
  protected _columns: TableColumns<T> = new TableColumns<T>([]);
  protected _dataSubject = new BehaviorSubject<T[]>([] as T[]);
  protected _data: T[] = [];

  dataSource = new MatTableDataSource<ITableRow<T>>([]);
  columnsToAutoCreate: TableColumn<T>[] = [];
  idsOfColumnsToDisplay: string[] = [];

  @ViewChild(MatTable, { static: true }) matTable!: MatTable<T>;
  @ViewChild(MatPaginator) matPaginator!: MatPaginator;
  @ContentChildren(MatColumnDef) matColumnDefs!: QueryList<MatColumnDef>;

  @Input() pageSize: number = 25;
  @Input() dataLoaded: boolean = true;
  @Input() noContentText: string = 'Nothing to display';
  @Input() loadingText: string = 'Loading...';
  @Input() createLabel: string = 'Create One';
  @Output() rowClicked = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();

  @Input()
  set columns(columns: TableColumns<T>) {
    this._columnsSubject.next(columns);
  }

  @Input()
  set columns$(columns$: Observable<TableColumns<T>>) {
    columns$.subscribe((columns) => this._columnsSubject.next(columns));
  }

  @Input()
  set data(data: T[]) {
    this._dataSubject.next(data);
  }

  @Input()
  set data$(data$: Observable<T[]>) {
    data$.subscribe((data) => this._dataSubject.next(data));
  }

  @Input()
  set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  @Input('filterValue')
  set filter(filter: string) {
    this.dataSource.filter = filter;
  }

  get filter(): string {
    return this.dataSource.filter;
  }

  constructor(
    protected _filterDialogService: FilterDialogService<T>,
    protected _showHideDialogService: ShowHideDialogService
  ) {
    // update when columns or data change
    combineLatest([
      this._columnsSubject.asObservable(),
      this._dataSubject.asObservable(),
    ]).subscribe(([columns, data]) => {
      this._columns = columns;
      this._data = data;
      this.idsOfColumnsToDisplay = columns.columnsToShow(data).map((c) => c.id);
      this.dataSource.data = columns.toRowData(columns.filter(data));
    });
  }

  ngAfterContentInit(): void {
    const idsOfColumnsDefined: string[] = [];
    this.matColumnDefs.forEach((matColumnDef) => {
      this.matTable.addColumnDef(matColumnDef);
      idsOfColumnsDefined.push(matColumnDef.name);
    });
    this.columnsToAutoCreate = this._columns.columns.filter(
      (column) => !idsOfColumnsDefined.includes(column.id)
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.matPaginator;
  }

  async onSetFilter(column: TableColumn<T>): Promise<void> {
    const dialogRef = this._filterDialogService.openFilterDialog(
      column,
      this._data
    );
    const filters = await firstValueFrom(dialogRef.afterClosed());
    if (filters) {
      column.filters = filters;
      this._columnsSubject.next(this._columns);
    }
  }

  get hasColumnsToShowHide(): boolean {
    return this._columns.columnsToShow(this._data, true, true).length > 0;
  }

  async onShowHideColumns(): Promise<void> {
    const dialogRef = this._showHideDialogService.openShowHideDialog(
      this._columns.columnsToShow(this._data, true, true),
      true // allow hiding all columns
    );
    const idsOfColumnsToHide = await firstValueFrom(dialogRef.afterClosed());
    if (idsOfColumnsToHide) {
      this._columns.idsOfColumnsToHide = idsOfColumnsToHide;
      this._columnsSubject.next(this._columns);
    }
  }
}
