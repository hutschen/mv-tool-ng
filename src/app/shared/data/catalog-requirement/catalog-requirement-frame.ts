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

import { map } from 'rxjs';
import { CatalogModule } from '../../services/catalog-module.service';
import {
  CatalogRequirement,
  CatalogRequirementService,
} from '../../services/catalog-requirement.service';
import { IQueryParams } from '../../services/query-params.service';
import {
  DescriptionColumn,
  SummaryColumn,
  TextColumn,
} from '../custom/custom-colums';
import { TextField } from '../custom/custom-fields';
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import { FilterByPattern, FilterForExistence, Filters } from '../filter';
import { CatalogRequirementReferencesFilter } from './catalog-requirement-filter';

export class CatalogRequirementDataFrame extends DataFrame<CatalogRequirement> {
  constructor(
    protected _catalogRequirementService: CatalogRequirementService,
    protected _catalogModule: CatalogModule,
    initQueryParams: IQueryParams = {}
  ) {
    const referenceColumn = new DataColumn(
      new TextField('reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new CatalogRequirementReferencesFilter(
          _catalogRequirementService,
          _catalogModule,
          initQueryParams
        ),
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    // GS Absicherung column
    const gsAbsicherungColumn = new TextColumn(
      new TextField('gs_absicherung', 'GS Absicherung'),
      'GS Absicherungen',
      initQueryParams
    );

    // GS Verantwortliche column
    const gsVerantwortlicheColumn = new TextColumn(
      new TextField('gs_verantwortliche', 'GS Verantwortliche'),
      'GS Verantwortliche',
      initQueryParams
    );

    super(
      [
        referenceColumn,
        new SummaryColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        gsAbsicherungColumn,
        gsVerantwortlicheColumn,
        new PlaceholderColumn('options'),
      ],
      initQueryParams
    );
    this.reload();
  }

  override getColumnNames() {
    return this._catalogRequirementService.getCatalogRequirementFieldNames({
      catalog_module_ids: this._catalogModule.id,
    });
  }

  override getData(queryParams: IQueryParams) {
    return this._catalogRequirementService.queryCatalogRequirements({
      catalog_module_ids: this._catalogModule.id,
      ...queryParams,
    });
  }
}
