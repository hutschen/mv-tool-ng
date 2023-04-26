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
import { RequirementService } from '../../services/requirement.service';
import { FilterByValues } from '../filter';
import { MilestoneService } from '../../services/milestone.service';
import { TargetObjectService } from '../../services/target-object.service';
import {
  MilestoneOptions,
  RequirementOptions,
  RequirementReferenceOptions,
  TargetObjectOptions,
} from './requirement-options';

export class RequirementReferencesFilter extends FilterByValues {
  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    initQueryParams: IQueryParams
  ) {
    super(
      'references',
      new RequirementReferenceOptions(_requirementService, _project, true),
      initQueryParams,
      'string'
    );
  }
}

export class RequirementsFilter extends FilterByValues {
  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      'requirement_ids',
      new RequirementOptions(_requirementService, _project, true),
      initQueryParams,
      'number'
    );
  }
}

export class MilestonesFilter extends FilterByValues {
  constructor(
    protected _milestoneService: MilestoneService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      'milestones',
      new MilestoneOptions(_milestoneService, _project, true),
      initQueryParams,
      'string'
    );
  }
}

export class TargetObjectsFilter extends FilterByValues {
  constructor(
    protected _targetObjectService: TargetObjectService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      'target_objects',
      new TargetObjectOptions(_targetObjectService, _project, true),
      initQueryParams,
      'string'
    );
  }
}
