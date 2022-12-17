// Copyright (C) 2022 Helmar Hutschenreuter
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
import { firstValueFrom, Observable } from 'rxjs';
import { CRUDService } from './crud.service';

export interface IUser {
  display_name: string;
  email_address: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(protected _crud: CRUDService<IUser, IUser>) {}

  getUserUrl(): string {
    return 'jira-user';
  }

  getUser(): Observable<IUser> {
    return this._crud.read(this.getUserUrl());
  }
}
