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
      this.measure = await this._measureService.updateMeasure_legacy(
        this.measure.id,
        measureInput
      );
      this.measureChange.emit(this.measure);
      this.loading = false;
    }
  }
}
