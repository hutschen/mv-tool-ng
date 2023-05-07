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
import { DocumentService } from '../../services/document.service';
import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';

export class DocumentReferenceOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _documentService: DocumentService,
    protected _project: Project,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request document references and convert them to options
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
    // Build query params to request document references
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

export class DocumentOptions extends Options {
  override readonly hasToLoad = true;

  constructor(
    protected _documentService: DocumentService,
    protected _project: Project,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  private __loadOptions(queryParams: IQueryParams): Observable<IOption[]> {
    // Request document representations and convert them to filter options
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

  override getOptions(...ids: number[]): Observable<IOption[]> {
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
    // Build query params to request document representations
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
