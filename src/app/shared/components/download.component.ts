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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IDownloadState } from '../services/download.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'mvtool-download',
  template: `
    <ng-container *ngIf="downloadState">
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
    </ng-container>
  `,
  styles: [],
})
export class DownloadComponent implements OnInit, OnDestroy {
  @Input() download$!: Observable<IDownloadState>;
  protected _downloadSubscription?: Subscription;
  downloadState?: IDownloadState;
  fileUrl?: SafeResourceUrl;
  protected _fileUrl?: string;

  constructor(protected _domSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this._downloadSubscription = this.download$.subscribe((downloadState) => {
      this.downloadState = downloadState;
      if (this.downloadState.content) {
        this._fileUrl = URL.createObjectURL(this.downloadState.content);
        this.fileUrl = this._domSanitizer.bypassSecurityTrustUrl(this._fileUrl);
      }
    });
  }

  ngOnDestroy(): void {
    if (this._fileUrl) URL.revokeObjectURL(this._fileUrl);
    this._downloadSubscription?.unsubscribe();
  }
}
