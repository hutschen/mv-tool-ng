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

import { Requirement } from '../../services/requirement.service';
import { TextField } from '../custom/custom-fields';

export class GSAbsicherungField extends TextField<Requirement> {
  constructor() {
    super('gs_absicherung', 'GS Absicherung');
  }

  override toValue(data: Requirement): string | null {
    return data.catalog_requirement?.gs_absicherung ?? null;
  }
}

export class GSVerantwortlicheField extends TextField<Requirement> {
  constructor() {
    super('gs_verantwortliche', 'GS Verantwortliche');
  }

  override toValue(data: Requirement): string | null {
    return data.catalog_requirement?.gs_verantwortliche ?? null;
  }
}
