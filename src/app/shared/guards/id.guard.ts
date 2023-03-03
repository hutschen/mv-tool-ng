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
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { isInt, toInt } from 'radash';

abstract class IdGuard {
  protected _router: Router;
  protected _idParamName: string;

  constructor(_router: Router, idParamName: string) {
    this._router = _router;
    this._idParamName = idParamName;
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const id = toInt(route.paramMap.get(this._idParamName), 0);
    if (0 < id) {
      return true;
    } else {
      this._router.navigate(['/']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class CatalogIdGuard extends IdGuard {
  constructor(router: Router) {
    super(router, 'catalogId');
  }
}

@Injectable({
  providedIn: 'root',
})
export class CatalogModuleIdGuard extends IdGuard {
  constructor(router: Router) {
    super(router, 'catalogModuleId');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProjectIdGuard extends IdGuard {
  constructor(router: Router) {
    super(router, 'projectId');
  }
}

@Injectable({
  providedIn: 'root',
})
export class RequirementIdGuard extends IdGuard {
  constructor(router: Router) {
    super(router, 'requirementId');
  }
}

@Injectable({
  providedIn: 'root',
})
export class MeasureIdGuard extends IdGuard {
  constructor(router: Router) {
    super(router, 'measureId');
  }
}
