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

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, merge, startWith, switchMap } from 'rxjs';
import { Measure, MeasureService } from '../shared/services/measure.service';

@Component({
  selector: 'mvtool-http-measure-table',
  templateUrl: './http-measure-table.component.html',
  styleUrls: [
    '../shared/styles/table.scss',
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
  ],
  styles: [],
})
export class HttpMeasureTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['reference', 'summary', 'description'];
  data: Measure[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(protected _measureService: MeasureService) {}

  ngAfterViewInit(): void {
    // When the user changes the sort order, reset to the first page
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this._measureService.getMeasuresPage(
            // this.sort.active,
            // this.sort.direction,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
          );
        }),
        map((data) => {
          this.isLoadingResults = false;
          this.resultsLength = data.total_count;
          return data.items;
        })
      )
      .subscribe((data) => (this.data = data));
  }
}
