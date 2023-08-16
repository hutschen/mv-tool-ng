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
import { IInteractionService } from './data/interaction';

export type VerificationMethod = 'R' | 'T' | 'I';
export type VerificationStatus =
  | 'verified'
  | 'partially verified'
  | 'not verified';

export interface IVerificationPatch {
  verification_method?: VerificationMethod | null;
  verification_status?: VerificationStatus | null;
  verification_comment?: string | null;
}

export interface IToVerifyItem extends IDataItem {
  verification_method: VerificationMethod | null;
  verification_status: VerificationStatus | null;
  verification_comment: string | null;
  get verified(): boolean;
}

export interface IVerificationService {
  patchVerification(
    itemId: IToVerifyItem['id'],
    verificationPatch: IVerificationPatch
  ): Observable<IToVerifyItem>;
}

export interface IVerificationInteractionService
  extends IInteractionService<IToVerifyItem> {
  onSetVerificationMethod(
    item: IToVerifyItem,
    verificationMethod: VerificationMethod | null
  ): Promise<void>;
  onSetVerificationStatus(
    item: IToVerifyItem,
    verificationStatus: VerificationStatus | null
  ): Promise<void>;
  onEditVerification(item: IToVerifyItem): Promise<void>;
}
