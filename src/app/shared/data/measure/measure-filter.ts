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

import { map, Observable } from 'rxjs';
import { FilterByValues, IFilterOption } from '../filter';
import { IQueryParams } from '../../services/query-params.service';
import { MeasureService } from '../../services/measure.service';
import { Project } from '../../services/project.service';

export class MeasureReferencesFilter extends FilterByValues {
  constructor(
    protected _measureService: MeasureService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('references', undefined, initQueryParams);
    this.loadOptions();
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request measure references
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
    };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    // Request measure references and convert them to filter options
    return this._measureService.getMeasureReferences(queryParams).pipe(
      map((references) => {
        if (!Array.isArray(references)) references = references.items;
        return references.map((reference) => ({
          value: reference,
          label: reference,
        }));
      })
    );
  }

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    // Build query params to request measure references
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
      references: values,
    };

    // Request measure references and convert them to filter options
    return this._measureService.getMeasureReferences(queryParams).pipe(
      map((references) => {
        if (!Array.isArray(references)) references = references.items;
        return references.map((reference) => ({
          value: reference,
          label: reference,
        }));
      })
    );
  }
}
