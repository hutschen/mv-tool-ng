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

import { DataColumn, DataFrame, PlaceholderColumn } from '../data';
import { Document, DocumentService } from '../../services/document.service';
import { Project } from '../../services/project.service';
import { IQueryParams } from '../../services/query-params.service';
import { TextField } from '../custom/custom-fields';
import { FilterByPattern, FilterForExistence, Filters } from '../filter';
import {
  CompletionColumn,
  DescriptionColumn,
  TitleColumn,
  VerificationColumn,
} from '../custom/custom-colums';
import { Observable } from 'rxjs';
import { DocumentReferencesFilter } from './document-filters';

export class DocumentDataFrame extends DataFrame<Document> {
  constructor(
    protected _documentService: DocumentService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    const referenceColumn = new DataColumn(
      new TextField('reference'),
      new Filters(
        'References',
        new FilterByPattern('reference', initQueryParams),
        new DocumentReferencesFilter(
          _documentService,
          _project,
          initQueryParams
        ),
        new FilterForExistence('has_reference', initQueryParams)
      ),
      initQueryParams
    );

    super(
      [
        referenceColumn,
        new TitleColumn(initQueryParams),
        new DescriptionColumn(initQueryParams),
        new CompletionColumn(initQueryParams),
        new VerificationColumn(initQueryParams),
        new PlaceholderColumn('options'),
      ],
      initQueryParams
    );
    this.reload();
  }

  override getColumnNames(): Observable<string[]> {
    return this._documentService.getDocumentFieldNames({
      project_ids: this._project.id,
    });
  }

  override getData(queryParams: IQueryParams) {
    return this._documentService.queryDocuments({
      project_ids: this._project.id,
      ...queryParams,
    });
  }
}
