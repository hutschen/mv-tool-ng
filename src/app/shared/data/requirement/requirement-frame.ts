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

import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import {
  Requirement,
  RequirementService,
} from '../../services/requirement.service';
import {
  ComplianceCommentColumn,
  ComplianceStatusColumn,
  DescriptionColumn,
  SummaryColumn,
  TextColumn,
} from '../custom/custom-colums';
import { TextField } from '../custom/custom-fields';
import { DataColumn, DataFrame } from '../data';
import { FilterByPattern, FilterForExistence, Filters } from '../filter';
import {
  GSAbsicherungField,
  GSVerantwortlicheField,
} from './requirement-fields';

export class RequirementDataFrame extends DataFrame<Requirement> {
  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    // Reference column
    const referenceColumn = new DataColumn(
      new TextField('reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        undefined, // TODO: add filter by values filter
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    // Catalog column
    // Catalog module column

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
        undefined, // TODO: add filter by values filter
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
        undefined, // TODO: add filter by values filter
        new FilterForExistence('has_target_object', initQueryParams)
      ),
      initQueryParams
    );

    // Completion column
    // Alert column
    // Options column
    super(
      [
        referenceColumn,
        new SummaryColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        gsAbsicherungColumn,
        gsVerantwortlicheColumn,
        milestoneColumn,
        targetObjectColumn,
        new ComplianceStatusColumn(initQueryParams),
        new ComplianceCommentColumn(initQueryParams),
      ],
      initQueryParams
    );
  }
}
