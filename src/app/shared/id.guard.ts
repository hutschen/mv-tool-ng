import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

abstract class IdGuard implements CanActivate {
  protected _router: Router
  protected _idParamName: string

  constructor(_router: Router, idParamName: string) { 
    this._router = _router;
    this._idParamName = idParamName;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      const id = route.paramMap.get(this._idParamName)
      if (isNaN(Number(id)) || Number(id) < 0) {
        this._router.navigate(['/']);
        return false;
      } else {
        return true;
      }
  }
  
}

@Injectable({
  providedIn: 'root'
})
export class ProjectIdGuard extends IdGuard {
  constructor(_router: Router) {
    super(_router, 'projectId');
  }
}

@Injectable({
  providedIn: 'root'
})
export class RequirementIdGuard extends IdGuard {
  constructor(_router: Router) {
    super(_router, 'requirementId');
  }
}

@Injectable({
  providedIn: 'root'
})
export class MeasureIdGuard extends IdGuard {
  constructor(_router: Router) {
    super(_router, 'measureId');
  }
}