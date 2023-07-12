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

import { toBulkEditScope, BulkEditScope } from './bulk-edit-scope';
import { IQueryParams } from './services/query-params.service';

describe('toBulkEditScope', () => {
  let queryParams: IQueryParams;

  beforeEach(() => {
    queryParams = {};
  });

  it('should return "all" when query params are empty', () => {
    const scope: BulkEditScope = toBulkEditScope(queryParams);
    expect(scope).toEqual('all');
  });

  it('should return "marked" when ids are defined in query params', () => {
    queryParams['ids'] = ['123', '456'];
    const scope: BulkEditScope = toBulkEditScope(queryParams);
    expect(scope).toEqual('marked');
  });

  it('should return "filtered" when ids are not defined but other params are present', () => {
    queryParams['otherParam'] = 'value';
    const scope: BulkEditScope = toBulkEditScope(queryParams);
    expect(scope).toEqual('filtered');
  });
});
