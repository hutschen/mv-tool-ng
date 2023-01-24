// Copyright (C) 2023 Helmar Hutschenreuter
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
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { ITableRow, TableColumn, TableColumns } from '../table-columns';

@Component({
  selector: 'mvtool-table',
  templateUrl: './table.component.html',
  styles: [],
})
export class TableComponent<T extends object> implements AfterContentInit {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() noContentLabel = 'Nothing to display.';
  @Input() loadingLabel = 'Loading...';
  @Input() createLabel = 'Create One';
  @Output() clickRow = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();

  @ViewChild(MatTable, { static: true }) matTable!: MatTable<T>;
  @ContentChildren(MatColumnDef) matColumnDefs!: QueryList<MatColumnDef>;

  columnsToAutoCreate: TableColumn<T>[] = [];

  constructor() {}

  ngAfterContentInit(): void {
    const idsOfColumnsDefined: string[] = this.matColumnDefs.map(
      (matColumnDef) => {
        this.matTable.addColumnDef(matColumnDef);
        return matColumnDef.name;
      }
    );
    this.columnsToAutoCreate = this.columns.filter(
      (column) => !idsOfColumnsDefined.includes(column.id)
    );
  }

  get idsOfColumnsToShow(): string[] {
    return new TableColumns(this.columns)
      .columnsToShow(this.data)
      .map((column) => column.id);
  }

  get rows(): ITableRow<T>[] {
    return this.data.map((data) => {
      return {
        data: data,
        ...Object.fromEntries(
          this.columns.map((column) => [column.id, column.toStr(data)])
        ),
      } as ITableRow<T>;
    });
  }
}
