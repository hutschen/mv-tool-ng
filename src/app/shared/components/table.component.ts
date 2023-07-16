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
import {
  MatColumnDef,
  MatTable,
  MatFooterRowDef,
} from '@angular/material/table';
import { DataColumn, DataFrame, IDataItem } from '../data/data';
import { DataSelection } from '../data/selection';
import { IQuickAddService } from './quick-add.component';

@Component({
  selector: 'mvtool-table',
  templateUrl: './table.component.html',
  styleUrls: [
    '../styles/table.scss',
    '../styles/flex.scss',
    '../styles/truncate.scss',
  ],
  styles: [
    '.clickable-row { cursor: pointer; }',
    '.clickable-row:hover { background-color: rgba(0,0,0,0.04) !important; }',
    '.marked { background-color: rgba(0,0,0,0.08) !important; }',
    '.hide { display: none; }',
  ],
})
export class TableComponent<T extends IDataItem> implements AfterContentInit {
  @Input() dataFrame!: DataFrame<T>;
  @Input() noContentText = 'Nothing to display.';
  @Input() loadingText = 'Loading...';
  @Input() createLabel = 'Create One';
  @Input() quickAddService?: IQuickAddService<T>;
  @Output() clickRow = new EventEmitter<T>();
  @Output() create = new EventEmitter<void>();

  @ViewChild(MatTable, { static: true }) matTable!: MatTable<T>;
  @ContentChildren(MatColumnDef) matColumnDefs!: QueryList<MatColumnDef>;
  @ContentChildren(MatFooterRowDef) matFooterRowDefs!: QueryList<MatFooterRowDef>; // prettier-ignore

  columnsToAutoCreate: DataColumn<T>[] = [];
  @Input() marked?: DataSelection<T>;
  @Input() expanded?: DataSelection<T>;

  constructor() {}

  ngAfterContentInit(): void {
    const columnNamesDefined: string[] = this.matColumnDefs.map(
      (matColumnDef) => {
        this.matTable.addColumnDef(matColumnDef);
        return matColumnDef.name;
      }
    );
    this.columnsToAutoCreate = this.dataFrame.columns.columns.filter(
      (column) => !columnNamesDefined.includes(column.name)
    );

    this.matFooterRowDefs.forEach((footerRowDef) =>
      this.matTable.addFooterRowDef(footerRowDef)
    );
  }
}
