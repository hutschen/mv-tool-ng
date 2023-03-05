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

import { Observable } from 'rxjs';
import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import {
  FilterByPattern,
  FilterByValues,
  FilterForExistence,
  Filters,
} from '../filter';
import { IQueryParams } from '../../services/query-params.service';
import { Measure, MeasureService } from '../../services/measure.service';
import {
  Requirement,
  RequirementService,
} from '../../services/requirement.service';
import { MeasureReferencesFilter } from './measure-filters';
import { StatusField, TextField } from '../custom/custom-fields';
import {
  DocumentField,
  JiraIssueField,
  MeasureCatalogField,
  MeasureCatalogModuleField,
  MilestoneField,
  RequirementField,
  TargetObjectField,
} from '../measure/measure-fields';
import {
  CompletionCommentColumn,
  ComplianceCommentColumn,
  ComplianceStatusColumn,
  DescriptionColumn,
  SummaryColumn,
  VerificationCommentColumn,
} from '../custom/custom-colums';
import { DocumentService } from '../../services/document.service';
import { DocumentsFilter } from '../document/document-filters';
import { Project } from '../../services/project.service';
import { CatalogService } from '../../services/catalog.service';
import { CatalogModuleService } from '../../services/catalog-module.service';
import { MilestoneService } from '../../services/milestone.service';
import { TargetObjectService } from '../../services/target-object.service';
import { CatalogsFilter } from '../catalog/catalog-filters';
import { CatalogModulesFilter } from '../catalog-module/catalog-module-filters';
import {
  MilestonesFilter,
  RequirementsFilter,
  TargetObjectsFilter,
} from '../requirement/requirement-filters';

export class MeasureDataFrame extends DataFrame<Measure> {
  protected _requirement?: Requirement;
  protected _project: Project;
  protected _additionalColumnNames: string[];

  constructor(
    protected _measureService: MeasureService,
    protected _documentService: DocumentService,
    requirementOrProject: Requirement | Project,
    initQueryParams: IQueryParams = {},
    catalogService?: CatalogService,
    catalogModuleService?: CatalogModuleService,
    requirementService?: RequirementService,
    milestoneService?: MilestoneService,
    targetObjectService?: TargetObjectService
  ) {
    const noRequirement = requirementOrProject instanceof Project;
    const project = noRequirement
      ? requirementOrProject
      : requirementOrProject.project;

    const additionalColumns: DataColumn<Measure>[] = [];

    // Catalog column
    if (catalogService) {
      additionalColumns.push(
        new DataColumn(
          new MeasureCatalogField(),
          new Filters(
            'Catalogs',
            undefined,
            new CatalogsFilter(catalogService, initQueryParams),
            new FilterForExistence('has_catalog', initQueryParams)
          ),
          initQueryParams
        )
      );
    }

    // Catalog module column
    if (catalogModuleService) {
      additionalColumns.push(
        new DataColumn(
          new MeasureCatalogModuleField(),
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
        )
      );
    }

    // Requirement column
    if (requirementService) {
      additionalColumns.push(
        new DataColumn(
          new RequirementField(),
          new Filters(
            'Requirements',
            undefined,
            new RequirementsFilter(
              requirementService,
              project,
              initQueryParams
            ),
            undefined
          ),
          initQueryParams
        )
      );
    }

    // Milestone column
    if (milestoneService) {
      additionalColumns.push(
        new DataColumn(
          new MilestoneField(),
          new Filters(
            'Milestone',
            new FilterByPattern('milestone', initQueryParams),
            new MilestonesFilter(milestoneService, project, initQueryParams),
            new FilterForExistence('has_milestone', initQueryParams)
          ),
          initQueryParams
        )
      );
    }

    // Target object column
    if (targetObjectService) {
      additionalColumns.push(
        new DataColumn(
          new TargetObjectField(),
          new Filters(
            'Target object',
            new FilterByPattern('target_object', initQueryParams),
            new TargetObjectsFilter(
              targetObjectService,
              project,
              initQueryParams
            ),
            new FilterForExistence('has_target_object', initQueryParams)
          ),
          initQueryParams
        )
      );
    }

    // Reference column
    const referenceColumn = new DataColumn(
      new TextField('reference', 'Reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new MeasureReferencesFilter(_measureService, project, initQueryParams),
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    // Document column
    const documentColumn = new DataColumn(
      new DocumentField(),
      new Filters(
        'Documents',
        undefined,
        new DocumentsFilter(_documentService, project, initQueryParams),
        new FilterForExistence('has_document', initQueryParams)
      ),
      initQueryParams
    );

    // Jira issue column
    const jiraIssueColumn = new DataColumn(
      new JiraIssueField(false),
      new Filters(
        'Jira Issues',
        undefined,
        undefined,
        new FilterForExistence('has_jira_issue', initQueryParams)
      ),
      initQueryParams
    );

    // Completion status column
    const completionStatusColumn = new DataColumn(
      new StatusField('completion_status', 'Completion'),
      new Filters(
        'Completion Statuses',
        undefined,
        new FilterByValues(
          'completion_statuses',
          [
            { value: 'open', label: 'Open' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ],
          initQueryParams
        ),
        new FilterForExistence('has_completion_status', initQueryParams)
      ),
      initQueryParams
    );

    // Verification method column
    const verificationMethodColumn = new DataColumn(
      new StatusField('verification_method', 'Verification Method'),
      new Filters(
        'Verification Methods',
        undefined,
        new FilterByValues(
          'verification_methods',
          [
            { value: 'I', label: 'Inspection (I)' },
            { value: 'T', label: 'Test (T)' },
            { value: 'R', label: 'Review (R)' },
          ],
          initQueryParams
        ),
        new FilterForExistence('has_verification_method', initQueryParams)
      ),
      initQueryParams
    );

    // Verification status column
    const verificationStatusColumn = new DataColumn(
      new StatusField('verification_status', 'Verification'),
      new Filters(
        'Verification Statuses',
        undefined,
        new FilterByValues(
          'verification_statuses',
          [
            { value: 'verified', label: 'Verified' },
            { value: 'partially verified', label: 'Partially Verified' },
            { value: 'not verified', label: 'Not Verified' },
          ],
          initQueryParams
        ),
        new FilterForExistence('has_verification_status', initQueryParams)
      ),
      initQueryParams
    );

    super(
      [
        ...additionalColumns,
        referenceColumn,
        new SummaryColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        documentColumn,
        new ComplianceStatusColumn(initQueryParams),
        new ComplianceCommentColumn(initQueryParams),
        jiraIssueColumn,
        completionStatusColumn,
        new CompletionCommentColumn(initQueryParams),
        verificationMethodColumn,
        verificationStatusColumn,
        new VerificationCommentColumn(initQueryParams),
        new PlaceholderColumn('options', 'Options'),
      ],
      initQueryParams
    );
    this._project = project;
    this._requirement = noRequirement ? undefined : requirementOrProject;
    this._additionalColumnNames = additionalColumns.map((c) => c.name);
    this.reload();
  }

  override getColumnNames(): Observable<string[]> {
    return this._measureService.getMeasureFieldNames({
      project_ids: this._project.id,
    });
  }

  override getData(queryParams: IQueryParams) {
    // Prepare query params
    if (this._requirement) {
      queryParams['requirement_ids'] = this._requirement.id;
    } else {
      queryParams['project_ids'] = this._project.id;
    }

    return this._measureService.queryMeasures(queryParams);
  }
}
