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

import { Observable } from 'rxjs';
import { IDataItem } from './data/data';
import { InteractionService } from './data/interaction';

export type CompletionStatus = 'open' | 'in progress' | 'completed';

export interface ICompletionPatch {
  completion_status?: CompletionStatus | null;
  completion_comment?: string | null;
}

export interface IToCompleteItem extends IDataItem {
  completion_status: CompletionStatus | null;
  completion_comment: string | null;
  get completed(): boolean;
}

export interface ICompletionService {
  patchCompletion(
    itemId: IToCompleteItem['id'],
    completionPatch: ICompletionPatch
  ): Observable<IToCompleteItem>;
}

export interface ICompletionInteractionService
  extends InteractionService<IToCompleteItem> {
  onSetCompletionStatus(
    item: IToCompleteItem,
    completionStatus: CompletionStatus | null
  ): Promise<void>;
  onEditCompletion(item: IToCompleteItem): Promise<void>;
}
