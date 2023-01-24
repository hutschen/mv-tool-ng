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

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, merge, startWith, switchMap } from 'rxjs';
import {
  DataColumn,
  DataField,
  DataFrame,
  PlaceholderField,
} from '../shared/data';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { Project } from '../shared/services/project.service';
import { Requirement } from '../shared/services/requirement.service';
import { ITableColumn, TableColumn } from '../shared/table-columns';
import {
  DocumentField,
  JiraIssueField,
  StatusField,
  VerifiedField,
} from './measure-fields';

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
  @Input() requirement?: Requirement;
  @Input() project?: Project;

  dataFrame: DataFrame<Measure> = new DataFrame<Measure>(
    [
      new DataField<Measure, string>('reference', 'Reference'),
      new DataField<Measure, string>('summary', 'Summary', false),
      new DataField<Measure, string>('description', 'Description'),
      new DocumentField(),
      new JiraIssueField(),
      new StatusField('compliance_status', 'Compliance'),
      new DataField<Measure, string>(
        'compliance_comment',
        'Compliance Comment'
      ),
      new StatusField('completion_status', 'Completion'),
      new DataField<Measure, string>(
        'completion_comment',
        'Completion Comment'
      ),
      new VerifiedField(),
      new StatusField('verification_method', 'Verification Method'),
      new DataField<Measure, string>(
        'verification_comment',
        'Verification Comment'
      ),
      new PlaceholderField<Measure>('options', 'Options'),
    ].map((dataField) => new DataColumn(dataField))
  );
  resultsLength = 0;
  isLoadingData = true;
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
          this.isLoadingData = true;
          return this._measureService.getMeasuresPage(
            // this.sort.active,
            // this.sort.direction,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            {
              project_ids: this.project ? [this.project.id] : [],
              requirement_ids: this.requirement ? [this.requirement.id] : [],
            }
          );
        }),
        map((data) => {
          this.isLoadingData = false;
          this.resultsLength = data.total_count;
          return data.items;
        })
      )
      .subscribe((data) => (this.dataFrame.data = data));
  }
}
