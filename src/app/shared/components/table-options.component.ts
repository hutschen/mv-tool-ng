import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'mvtool-table-options',
  template: `
  
    <div align="end">
      <button mat-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
      <button 
        *ngIf="edit.observed"
        mat-menu-item
        (click)="edit.emit()">
        <mat-icon>edit</mat-icon>
        Edit
      </button>
      <button
        *ngIf="delete.observed"
        mat-menu-item color="warn" 
        (click)="delete.emit()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
      </mat-menu>
  `,
  styles: [
  ]
})
export class TableOptionsComponent {
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  constructor() { }
}
