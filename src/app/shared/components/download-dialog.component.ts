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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { IDownloadState } from '../services/download.service';

export interface IDownloadDialogData {
  download$: Observable<IDownloadState>;
  filename: string;
}

@Component({
  selector: 'mvtool-download-dialog',
  template: `
    <div mat-dialog-content *ngIf="downloadState">
      <strong>
        <p *ngIf="downloadState.state == 'pending'">Preparing download</p>
        <p *ngIf="downloadState.state != 'pending'">
          {{ downloadState.progress }}% complete
        </p>
      </strong>
      <mat-progress-bar
        [mode]="downloadState.state == 'pending' ? 'buffer' : 'determinate'"
        [value]="downloadState.progress"
      >
      </mat-progress-bar>
    </div>
    <div
      mat-dialog-actions
      *ngIf="downloadState"
      mat-dialog-actions
      align="end"
    >
      <button mat-button (click)="onClose()">Cancel</button>
      <a
        mat-raised-button
        [disabled]="!downloadUrl"
        color="accent"
        [href]="downloadUrl"
        [download]="filename"
        (click)="onClose()"
      >
        <mat-icon>save</mat-icon>
        Save file
      </a>
    </div>
  `,
  styles: [],
})
export class DownloadDialogComponent {
  filename: string;
  downloadState: IDownloadState | null = null;
  downloadUrl: SafeResourceUrl | null = null;
  protected _downloadUrl: string | null = null;

  constructor(
    protected _dialogRef: MatDialogRef<DownloadDialogComponent>,
    protected _domSanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) dialogData: IDownloadDialogData
  ) {
    this.filename = dialogData.filename;

    // handle download
    const subscription = dialogData.download$.subscribe((download) => {
      this.downloadState = download;
      if (this.downloadState.content) {
        this._downloadUrl = URL.createObjectURL(this.downloadState.content);
        this.downloadUrl = this._domSanitizer.bypassSecurityTrustUrl(
          this._downloadUrl
        );
      }
    });

    // handle when dialog is closed
    this._dialogRef.afterClosed().subscribe(() => {
      if (this._downloadUrl) {
        // Delete temporary url
        URL.revokeObjectURL(this._downloadUrl);
      }
      subscription.unsubscribe();
    });
  }

  onClose(): void {
    this._dialogRef.close(null);
  }
}
