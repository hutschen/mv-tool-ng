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

import { InteractionService } from './data/interaction';
import { Measure } from './services/measure.service';
import { ComplianceStatus, Requirement } from './services/requirement.service';

export type CompliantItem = Measure | Requirement;

export interface ComplianceInteractionService
  extends InteractionService<CompliantItem> {
  onSetComplianceStatus(
    item: CompliantItem,
    complianceStatus: ComplianceStatus | null
  ): Promise<void>;
  onEditCompliance(item: CompliantItem): Promise<void>;
}
