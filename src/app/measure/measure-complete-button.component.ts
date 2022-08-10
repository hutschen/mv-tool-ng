import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Measure, MeasureService } from '../shared/services/measure.service';

@Component({
  selector: 'mvtool-measure-complete-button',
  template: `
    <div *ngIf="measure && !loading">
      <button mat-button (click)="onToggleComplete()">
        <mat-icon *ngIf="measure.completed">check</mat-icon>
        <mat-icon *ngIf="!measure.completed">close</mat-icon>
      </button>
    </div>

    <div *ngIf="loading">
      <mat-spinner
        *ngIf="loading"
        diameter="20"
        style="margin-left: 20px;"
      ></mat-spinner>
    </div>
  `,
  styles: [],
})
export class MeasureCompleteButtonComponent implements OnInit {
  @Input() measure: Measure | null = null;
  @Output() measureChange: EventEmitter<Measure> = new EventEmitter<Measure>();
  loading = false;

  constructor(protected _measureService: MeasureService) {}

  ngOnInit(): void {}

  async onToggleComplete(): Promise<void> {
    if (this.measure) {
      this.loading = true;
      const measureInput = this.measure.toMeasureInput();
      measureInput.completed = !this.measure.completed;
      this.measure = await this._measureService.updateMeasure(
        this.measure.id,
        measureInput
      );
      this.measureChange.emit(this.measure);
      this.loading = false;
    }
  }
}
