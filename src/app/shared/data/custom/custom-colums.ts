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

import { IQueryParams } from '../../services/query-params.service';
import { DataColumn, IDataItem } from '../data';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
  Filters,
} from '../filter';
import { StatusField, StrField } from './custom-fields';

export class ComplianceStatusColumn<D extends IDataItem> extends DataColumn<D> {
  constructor(initQueryParams: IQueryParams, optional: boolean = true) {
    super(
      new StatusField('compliance_status', 'Compliance', optional),
      new Filters(
        'Compliance',
        undefined,
        new FilterByValues(
          'compliance_statuses',
          [
            { value: 'C', label: 'Compliant (C)' },
            { value: 'PC', label: 'Partially Compliant (PC)' },
            { value: 'NC', label: 'Not Compliant (NC)' },
            { value: 'N/A', label: 'Not Applicable (N/A)' },
          ],
          initQueryParams
        ),
        new FilterForExistence('has_compliance_status', initQueryParams)
      ),
      initQueryParams
    );
  }
}

class TextColumn<D extends IDataItem> extends DataColumn<D> {
  constructor(
    field: StrField<D>,
    filtersLabel?: string,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      field,
      new Filters(
        filtersLabel ?? field.label,
        new FilterByPattern(field.name, initQueryParams),
        undefined,
        new FilterForExistence('has_' + field.name, initQueryParams)
      ),
      initQueryParams
    );
  }
}

export class ComplianceCommentColumn<
  D extends IDataItem
> extends TextColumn<D> {
  constructor(initQueryParams: IQueryParams = {}, optional: boolean = true) {
    super(
      new StrField('compliance_comment', null, optional),
      'Compliance Comments',
      initQueryParams
    );
  }
}
