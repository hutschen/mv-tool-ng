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
import { DataColumn, DataFrame, IDataItem } from '../data';

@Component({
  selector: 'mvtool-table',
  templateUrl: './table.component.html',
  styleUrls: [
    '../styles/table.scss',
    '../styles/flex.scss',
    '../styles/truncate.scss',
  ],
  styles: [],
})
export class TableComponent<T extends IDataItem> implements AfterContentInit {
  @Input() dataFrame!: DataFrame<T>;
  @Input() isLoadingData = false;
  @Input() noContentText = 'Nothing to display.';
  @Input() loadingText = 'Loading...';
  @Input() createLabel = 'Create One';
  @Output() clickRow = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();

  @ViewChild(MatTable, { static: true }) matTable!: MatTable<T>;
  @ContentChildren(MatColumnDef) matColumnDefs!: QueryList<MatColumnDef>;

  columnsToAutoCreate: DataColumn<T>[] = [];

  constructor() {}

  ngAfterContentInit(): void {
    const columnNamesDefined: string[] = this.matColumnDefs.map(
      (matColumnDef) => {
        this.matTable.addColumnDef(matColumnDef);
        return matColumnDef.name;
      }
    );
    this.columnsToAutoCreate = this.dataFrame.columns.filter(
      (column) => !columnNamesDefined.includes(column.name)
    );
  }

  get columnNames(): string[] {
    return this.dataFrame.shownColumns.map((column) => column.name);
  }
}
