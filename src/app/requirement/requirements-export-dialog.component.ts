import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import {
  DownloadService,
  IDownloadState,
} from '../shared/services/download.service';
import { Project } from '../shared/services/project.service';
import { RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirements-export-dialog',
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
export class RequirementsExportDialogComponent {
  download: IDownloadState | null = null;
  filename: string = 'requirements.xlsx';
  downloadUrl: SafeResourceUrl | null = null;
  protected _downloadUrl: string | null = null;

  constructor(
    protected _dialogRef: MatDialogRef<RequirementsExportDialogComponent>,
    protected _requirementService: RequirementService,
    protected _domSanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) protected _project: Project
  ) {
    const subscription = this._requirementService
      .downloadRequirementsExcel(this._project.id)
      .subscribe((download) => {
        this.download = download;
        if (this.download.content) {
          this._downloadUrl = URL.createObjectURL(this.download.content);
          this.downloadUrl = this._domSanitizer.bypassSecurityTrustUrl(
            this._downloadUrl
          );
        }
      });
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

  // TODO: Prevent closing the dialog if the download is started
  // TODO: Delete temporary url when dialog is closed
  onClose(): void {
    this._dialogRef.close(null);
  }
}
