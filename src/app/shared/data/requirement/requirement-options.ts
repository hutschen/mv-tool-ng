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

import { Observable, map, of } from 'rxjs';
import { IOption, Options } from '../options';
import { IQueryParams } from '../../services/query-params.service';
import { RequirementService } from '../../services/requirement.service';
import { Project } from '../../services/project.service';
import { MilestoneService } from '../../services/milestone.service';
import { TargetObjectService } from '../../services/target-object.service';

export class RequirementReferenceOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request requirement references and convert them to options
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

  override getOptions(...references: string[]): Observable<IOption[]> {
    if (!references.length) return of([]);
    return this.__loadOptions({
      project_ids: this._project.id,
      references: references,
    });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request requirement references
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
    };
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}

export class RequirementOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _requirementService: RequirementService,
    protected _project: Project,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
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

  override getOptions(...ids: string[]): Observable<IOption[]> {
    if (!ids.length) return of([]);
    return this.__loadOptions({
      project_ids: this._project.id,
      ids: ids,
    });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request requirements
    const queryParams: IQueryParams = {
      project_ids: this._project.id,
    };
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}

export class MilestoneOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _milestoneService: MilestoneService,
    protected _project: Project,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request milestones and convert them to options
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

  override getOptions(...milestones: string[]): Observable<IOption[]> {
    if (!milestones.length) return of([]);
    return this.__loadOptions({
      milestones: milestones,
      project_ids: this._project.id,
    });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request milestones
    const queryParams: IQueryParams = { project_ids: this._project.id };
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}

export class TargetObjectOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _targetObjectService: TargetObjectService,
    protected _project: Project,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request target objects and convert them to options
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

  override getOptions(...targetObjects: string[]): Observable<IOption[]> {
    if (!targetObjects.length) return of([]);
    return this.__loadOptions({
      project_ids: this._project.id,
      target_objects: targetObjects,
    });
  }

  override filterOptions(
    filter?: string | null,
    limit?: number
  ): Observable<IOption[]> {
    // Build query params to request target objects
    const queryParams: IQueryParams = { project_ids: this._project.id };
    if (filter) queryParams['local_search'] = filter;
    if (limit) {
      queryParams['page'] = 1;
      queryParams['page_size'] = limit;
    }

    return this.__loadOptions(queryParams);
  }
}
