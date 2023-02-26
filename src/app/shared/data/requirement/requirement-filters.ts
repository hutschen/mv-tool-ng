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
import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import { RequirementService } from '../../services/requirement.service';
import { FilterByValues, IFilterOption } from '../filter';
import { MilestoneService } from '../../services/milestone.service';
import { TargetObjectService } from '../../services/target-object.service';

export class RequirementReferencesFilter extends FilterByValues {
  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    initQueryParams: IQueryParams
  ) {
    super('references', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request requirement references and convert them to filter options
    return this._requirementService.getRequirementReferences(queryParams).pipe(
      map((references) => {
        if (!Array.isArray(references)) references = references.items;
        return references.map((reference) => ({
          value: reference,
          label: reference,
        }));
      })
    );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request requirement references
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
    };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
      references: values,
    };
    return this.__loadOptions(queryParams);
  }
}

export class RequirementsFilter extends FilterByValues {
  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('requirements', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request requirements and convert them to filter options
    return this._requirementService
      .getRequirementRepresentations(queryParams)
      .pipe(
        map((requirementReprs) => {
          if (!Array.isArray(requirementReprs)) {
            requirementReprs = requirementReprs.items;
          }
          return requirementReprs.map((rr) => ({
            value: rr.id,
            label: (rr.reference ? rr.reference + ' ' : '') + rr.summary,
          }));
        })
      );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request requirements
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
    };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
      ids: values,
    };
    return this.__loadOptions(queryParams);
  }
}

export class MilestonesFilter extends FilterByValues {
  constructor(
    protected _milestoneService: MilestoneService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('milestones', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request milestones and convert them to filter options
    return this._milestoneService.getMilestones(queryParams).pipe(
      map((milestones) => {
        if (!Array.isArray(milestones)) milestones = milestones.items;
        return milestones.map((milestone) => ({
          value: milestone,
          label: milestone,
        }));
      })
    );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request milestones
    const queryParams: IQueryParams = { project_ids: this._project.id };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    const queryParams: IQueryParams = {
      milestones: values,
      project_ids: this._project.id,
    };
    return this.__loadOptions(queryParams);
  }
}

export class TargetObjectsFilter extends FilterByValues {
  constructor(
    protected _targetObjectService: TargetObjectService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('target_objects', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request target objects and convert them to filter options
    return this._targetObjectService.getTargetObjects(queryParams).pipe(
      map((targetObjects) => {
        if (!Array.isArray(targetObjects)) targetObjects = targetObjects.items;
        return targetObjects.map((targetObject) => ({
          value: targetObject,
          label: targetObject,
        }));
      })
    );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request target objects
    const queryParams: IQueryParams = { project_ids: this._project.id };
    if (searchStr) queryParams['local_search'] = searchStr;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }

  override getOptionsByValues(
    values: (string | number)[]
  ): Observable<IFilterOption[]> {
    const queryParams: IQueryParams = {
      target_objects: values,
      project_ids: this._project.id,
    };
    return this.__loadOptions(queryParams);
  }
}
