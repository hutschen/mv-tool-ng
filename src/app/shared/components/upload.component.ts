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
import { Observable, Subscription } from 'rxjs';
import { IUploadState } from '../services/upload.service';

@Component({
  selector: 'mvtool-upload',
  template: `
    <ng-container *ngIf="uploadState">
      <p *ngIf="uploadState.state == 'pending'">Preparing upload</p>
      <p *ngIf="uploadState.state != 'pending'">
        {{ uploadState.progress }}% complete
      </p>
      <mat-progress-bar
        [mode]="uploadState.state == 'pending' ? 'buffer' : 'determinate'"
        [value]="uploadState.progress"
      >
      </mat-progress-bar>
    </ng-container>
  `,
  styles: [],
})
export class UploadComponent implements OnInit, OnDestroy {
  @Input() upload$!: Observable<IUploadState>;
  protected _uploadSubscription?: Subscription;
  uploadState?: IUploadState;

  ngOnInit(): void {
    this._uploadSubscription = this.upload$.subscribe((uploadState) => {
      this.uploadState = uploadState;
    });
  }

  ngOnDestroy(): void {
    this._uploadSubscription?.unsubscribe();
  }
}
