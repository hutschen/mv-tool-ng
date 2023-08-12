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

import { IDataItem } from './data/data';
import { InteractionService } from './data/interaction';

export type ComplianceStatus = 'C' | 'PC' | 'NC' | 'N/A';

export interface ICompliantItem extends IDataItem {
  compliance_status: ComplianceStatus | null;
  compliance_status_hint?: ComplianceStatus | null;
  compliance_comment: string | null;
}

export interface ComplianceInteractionService
  extends InteractionService<ICompliantItem> {
  onSetComplianceStatus(
    item: ICompliantItem,
    complianceStatus: ComplianceStatus | null
  ): Promise<void>;
  onEditCompliance(item: ICompliantItem): Promise<void>;
}
