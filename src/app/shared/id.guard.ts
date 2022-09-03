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
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

abstract class IdGuard implements CanActivate {
  protected _router: Router;
  protected _idParamName: string;

  constructor(_router: Router, idParamName: string) {
    this._router = _router;
    this._idParamName = idParamName;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const id = route.paramMap.get(this._idParamName);
    if (isNaN(Number(id)) || Number(id) < 0) {
      this._router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProjectIdGuard extends IdGuard {
  constructor(_router: Router) {
    super(_router, 'projectId');
  }
}

@Injectable({
  providedIn: 'root',
})
export class RequirementIdGuard extends IdGuard {
  constructor(_router: Router) {
    super(_router, 'requirementId');
  }
}

@Injectable({
  providedIn: 'root',
})
export class MeasureIdGuard extends IdGuard {
  constructor(_router: Router) {
    super(_router, 'measureId');
  }
}
