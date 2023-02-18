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
import { DocumentService } from '../../services/document.service';
import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import { FilterByValues, IFilterOption } from '../filter';

export class DocumentReferencesFilters extends FilterByValues {
  constructor(
    protected _documentService: DocumentService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('references', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request document references and convert them to filter options
    return this._documentService.getDocumentReferences(queryParams).pipe(
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
    // Build query params to request document references
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

export class DocumentsFilter extends FilterByValues {
  constructor(
    protected _documentService: DocumentService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super('document_ids', undefined, initQueryParams);
    this.loadOptions();
  }

  private __loadOptions(
    queryParams: IQueryParams
  ): Observable<IFilterOption[]> {
    // Request documents and convert them to filter options
    return this._documentService.getDocumentRepresentations(queryParams).pipe(
      map((documentReprs) => {
        if (!Array.isArray(documentReprs)) documentReprs = documentReprs.items;
        return documentReprs.map((dr) => ({
          value: dr.id,
          label: (dr.reference ? dr.reference + ' ' : '') + dr.title,
        }));
      })
    );
  }

  override getOptions(
    searchStr: string | null = null,
    limit: number = -1
  ): Observable<IFilterOption[]> {
    // Build query params to request document representations
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
