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

import { FilterByValues } from '../filter';
import { IQueryParams } from '../../services/query-params.service';
import { MeasureService } from '../../services/measure.service';
import { Project } from '../../services/project.service';
import { MeasureReferenceOptions } from './measure-options';

export class MeasureReferencesFilter extends FilterByValues {
  constructor(
    protected _measureService: MeasureService,
    protected _project: Project,
    initQueryParams: IQueryParams = {}
  ) {
    super(
      'references',
      new MeasureReferenceOptions(_measureService, _project, true),
      initQueryParams,
      'string'
    );
  }
}
