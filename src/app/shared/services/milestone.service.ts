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

import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IQueryParams } from './query-params.service';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  constructor(protected _crud: CRUDService<string, string>) {}

  getMilestones(params: IQueryParams) {
    return this._crud.query('milestones', params as IQueryParams);
  }
}
