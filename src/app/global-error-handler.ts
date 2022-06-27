import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from "@angular/router";
import { AuthService } from "./shared/services/auth.service";

@Injectable()
export class GlobalErrorHandler {
  constructor(
    protected _zone: NgZone, protected _snackBar: MatSnackBar,
    protected _auth: AuthService, protected _router: Router) { }

  async handleUnauthorized(error: any): Promise<void> {
    await this._router.navigate(['/login']);
    this._auth.logOut();
    this._snackBar.open(
      'Log in failed. Please try to log in again.', 
      'Close', {duration: 10*1000 });
  }

  handleUnexpectedError(error: any): void {
    this._snackBar.open(
      error?.message || 'Unexpected error occurred. Please try again later.', 
      'Close', {duration: 10*1000 });
  }
  
  handleError(error: any): void {
    console.log(error)
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    this._zone.run(() => {
      switch (error.status) {
        case 401:
          this.handleUnauthorized(error);
          break;
        default: 
          this.handleUnexpectedError(error);
          break;
      }
    });
  }
}