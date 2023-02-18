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
import { CatalogModuleService } from '../../services/catalog-module.service';
import { CatalogService } from '../../services/catalog.service';
import { MilestoneService } from '../../services/milestone.service';
import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import {
  Requirement,
  RequirementService,
} from '../../services/requirement.service';
import { TargetObjectService } from '../../services/target-object.service';
import { CatalogModulesFilter } from '../catalog-module/catalog-module-filters';
import { CatalogsFilter } from '../catalog/catalog-filters';
import {
  CompletionColumn,
  ComplianceCommentColumn,
  ComplianceStatusColumn,
  DescriptionColumn,
  SummaryColumn,
  TextColumn,
} from '../custom/custom-colums';
import { TextField } from '../custom/custom-fields';
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import { FilterByPattern, FilterForExistence, Filters } from '../filter';
import {
  CatalogField,
  CatalogModuleField,
  ComplianceAlertField,
  GSAbsicherungField,
  GSVerantwortlicheField,
} from './requirement-fields';
import {
  RequirementReferencesFilter,
  MilestonesFilter,
  TargetObjectsFilter,
} from './requirement-filters';

export class RequirementDataFrame extends DataFrame<Requirement> {
  constructor(
    protected _requirementService: RequirementService,
    catalogService: CatalogService,
    catalogModuleService: CatalogModuleService,
    milestoneService: MilestoneService,
    targetObjectService: TargetObjectService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    // Reference column
    const referenceColumn = new DataColumn(
      new TextField('reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new RequirementReferencesFilter(
          _requirementService,
          _project,
          initQueryParams
        ),
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    // Catalog column
    const catalogColumn = new DataColumn(
      new CatalogField(),
      new Filters(
        'Catalogs',
        undefined,
        new CatalogsFilter(catalogService, initQueryParams),
        new FilterForExistence('has_catalog', initQueryParams)
      ),
      initQueryParams
    );

    // Catalog module column
    const catalogModuleColumn = new DataColumn(
      new CatalogModuleField(),
      new Filters(
        'Catalog Modules',
        undefined,
        new CatalogModulesFilter(
          catalogModuleService,
          undefined,
          initQueryParams
        ),
        new FilterForExistence('has_catalog_module', initQueryParams)
      ),
      initQueryParams
    );

    // GS Absicherung column
    const gsAbsicherungColumn = new TextColumn(
      new GSAbsicherungField(),
      'GS Absicherungen',
      initQueryParams
    );

    // GS Verantwortliche column
    const gsVerantwortlicheColumn = new TextColumn(
      new GSVerantwortlicheField(),
      'GS Verantwortliche',
      initQueryParams
    );

    // Milestone column
    const milestoneColumn = new DataColumn(
      new TextField('milestone'),
      new Filters(
        'Milestone',
        new FilterByPattern('milestone', initQueryParams),
        new MilestonesFilter(milestoneService, _project, initQueryParams),
        new FilterForExistence('has_milestone', initQueryParams)
      ),
      initQueryParams
    );

    // Target object column
    const targetObjectColumn = new DataColumn(
      new TextField('target_object'),
      new Filters(
        'Target object',
        new FilterByPattern('target_object', initQueryParams),
        new TargetObjectsFilter(targetObjectService, _project, initQueryParams),
        new FilterForExistence('has_target_object', initQueryParams)
      ),
      initQueryParams
    );

    // Alert column
    const complianceAlertColumn = new DataColumn(
      new ComplianceAlertField(),
      null,
      initQueryParams
    );

    super(
      [
        referenceColumn,
        catalogColumn,
        catalogModuleColumn,
        new SummaryColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        gsAbsicherungColumn,
        gsVerantwortlicheColumn,
        milestoneColumn,
        targetObjectColumn,
        new ComplianceStatusColumn(initQueryParams),
        new ComplianceCommentColumn(initQueryParams),
        new CompletionColumn(initQueryParams),
        complianceAlertColumn,
        new PlaceholderColumn('options'),
      ],
      initQueryParams
    );
    this.reload();
  }

  override getColumnNames(): Observable<string[]> {
    return this._requirementService.getRequirementFieldNames({
      project_ids: this._project.id,
    });
  }

  override getData(queryParams: IQueryParams): Observable<Requirement[]> {
    // Query requirements and set length of data frame
    return this._requirementService
      .queryRequirements({
        project_ids: this._project.id,
        ...queryParams,
      })
      .pipe(
        map((requirements) => {
          if (Array.isArray(requirements)) {
            this.length = requirements.length;
            return requirements;
          } else {
            this.length = requirements.total_count;
            return requirements.items;
          }
        })
      );
  }
}
