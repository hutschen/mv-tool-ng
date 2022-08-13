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
    <div mat-dialog-content *ngIf="download">
      <strong>
        <p *ngIf="download.state == 'pending'">Preparing download</p>
        <p *ngIf="download.state != 'pending'">
          {{ download.progress }}% complete
        </p>
      </strong>
      <mat-progress-bar
        [mode]="download.state == 'pending' ? 'buffer' : 'determinate'"
        [value]="download.progress"
      >
      </mat-progress-bar>
    </div>
    <div mat-dialog-actions *ngIf="download" mat-dialog-actions align="end">
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
  download: IDownloadState | null = null;
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
      this.download = download;
      if (this.download.content) {
        this._downloadUrl = URL.createObjectURL(this.download.content);
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
      } else {
        // Cancel download
        subscription.unsubscribe();
      }
    });
  }

  onClose(): void {
    this._dialogRef.close(null);
  }
}
