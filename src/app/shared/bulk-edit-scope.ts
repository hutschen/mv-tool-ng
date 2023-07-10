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

import { isEmpty } from 'radash';
import { IQueryParams } from './services/query-params.service';

export type BulkEditScope = 'all' | 'filtered' | 'marked';

export function toBulkEditScope(queryParams: IQueryParams): BulkEditScope {
  if (isEmpty(queryParams)) {
    return 'all';
  } else if (queryParams['ids'] !== undefined) {
    return 'marked';
  } else {
    return 'filtered';
  }
}
