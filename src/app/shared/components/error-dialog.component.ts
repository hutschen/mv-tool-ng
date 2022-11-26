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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'mvtool-error-dialog',
  template: `
    <div mat-dialog-title>
      Error {{ error.status }} - {{ error.statusText }}
    </div>
    <div mat-dialog-content>
      <p *ngIf="!error.error.detail">{{ error.message }}</p>
      <p *ngIf="error.error.detail">{{ error.error.detail }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-raised-button color="accent" (click)="onClose()">
        Close
      </button>
    </div>
  `,
  styles: [],
})
export class ErrorDialogComponent {
  error: any;

  constructor(
    protected _dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public error$: Observable<any>
  ) {
    this.error$.subscribe((error) => (this.error = error));
  }

  onClose() {
    this._dialogRef.close();
  }
}
