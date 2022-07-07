import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mvtool-table-toolbar',
  template: `
    <div fxLayout="row" fxLayoutAlign="space-between center">
      <div fxLayout="row" fxLayoutAlign="start center">
        <!-- Button to refresh table -->
        <button 
          *ngIf="refresh.observed"
          mat-button (click)="refresh.emit()">
          <mat-icon>refresh</mat-icon>
          {{ refeshLabel }}
        </button>

        <!-- Button to create item -->
        <button
          *ngIf="create.observed"
          mat-button (click)="create.emit()">
          <mat-icon>add</mat-icon>
          {{ createLabel }}
        </button>
          
        <!-- Button to upload / import -->
        <button 
          *ngIf="upload.observed"
          mat-button (click)="upload.emit()">
          <mat-icon>file_upload</mat-icon>
          {{ uploadLabel }}
        </button>
    
        <!-- Button to download / export -->
        <button
          *ngIf="download.observed" 
          mat-button (click)="download.emit()">
          <mat-icon>file_download</mat-icon>
          {{ downloadLabel }}
        </button>
      </div>

      <!-- Filter -->
      <div 
        *ngIf="filter.observed"
        fxFlex="30" fxLayout="column">
        <mat-form-field appearance="fill">
          <mat-label>{{ filterLabel }}</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput (keyup)="onFilter($event)">
        </mat-form-field>
      </div>
    </div>
  `,
  styles: []
})
export class TableToolbarComponent {
  @Output() refresh = new EventEmitter();
  @Output() create = new EventEmitter();
  @Output() upload = new EventEmitter();
  @Output() download = new EventEmitter();
  @Output() filter = new EventEmitter<string>();
  @Input() refeshLabel: string = 'Refresh Table';
  @Input() createLabel: string = 'Create';
  @Input() uploadLabel: string = 'Upload Excel';
  @Input() downloadLabel: string = 'Download Excel';
  @Input() filterLabel: string = 'Filter';

  constructor() { }

  onFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter.emit(filterValue);
  }
}
