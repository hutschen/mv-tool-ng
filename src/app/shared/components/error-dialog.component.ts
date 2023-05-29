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

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ErrorReport } from '../services/error.service';

@Component({
  selector: 'mvtool-error-dialog',
  template: `
    <div mat-dialog-title>
      <span *ngIf="1 >= errorReports.length">Error Report</span>
      <span *ngIf="1 < errorReports.length">Error Reports</span>
    </div>
    <div mat-dialog-content>
      <ul>
        <li *ngFor="let errReport of errorReports">
          <strong *ngIf="errReport.code">{{ errReport.code }}&nbsp;</strong>
          <strong *ngIf="errReport.title">{{ errReport.title }}&nbsp;</strong>
          <span *ngIf="errReport.detail">{{ errReport.detail }}</span>
        </li>
      </ul>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-raised-button color="accent" (click)="onClose()">
        Close
      </button>
    </div>
  `,
  styles: [
    'ul { list-style-type: none; margin: 0; padding: 0; }',
    'li:not(:last-child) { margin-bottom: 1em; }',
  ],
})
export class ErrorDialogComponent {
  errorReports: ErrorReport[] = [];

  constructor(
    protected _dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) errorReports$: Observable<ErrorReport>
  ) {
    errorReports$.subscribe((error) => this.errorReports.push(error));
  }

  onClose() {
    this._dialogRef.close();
  }
}
