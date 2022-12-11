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
import { TableColumn, TableColumns } from '../table-columns';
import { FilterDialogService } from './filter-dialog.component';

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

  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;
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
