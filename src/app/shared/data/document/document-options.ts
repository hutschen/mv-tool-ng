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

export class DocumentOptions extends Options {
  readonly hasToLoad = true;

  constructor(
    protected _documentService: DocumentService,
    protected _project: Project,
    multiple: boolean = true,
    initDocumentIds: number[] = []
  ) {
    super(multiple, initDocumentIds);
    this.loadOptions();
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

  getOptions(...documentIds: number[]): Observable<IOption[]> {
    if (documentIds.length === 0) {
      return of([]);
    }

    return this.__loadOptions({
      project_ids: this._project.id,
      ids: documentIds,
    });
  }

  filterOptions(
    filter?: string | null | undefined,
    limit?: number | undefined
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
