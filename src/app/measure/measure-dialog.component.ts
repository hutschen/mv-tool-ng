import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMeasureInput, Measure } from '../shared/services/measure.service';

export interface IMeasureDialogData {
  projectId: number;
  measure: Measure | null;
}

@Component({
  selector: 'mvtool-measure-dialog',
  templateUrl: './measure-dialog.component.html',
  styles: [
    'textarea { min-height: 100px; }'
  ]
})
export class MeasureDialogComponent {
  requirementId: number;
  measureInput: IMeasureInput = {
    summary: '',
    description: null
  }
  
  constructor(
    protected _dialogRef: MatDialogRef<MeasureDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IMeasureDialogData) { 
    this.requirementId = this._dialogData.projectId;
    if (this._dialogData.measure) {
      this.measureInput = this._dialogData.measure.toMeasureInput();
    }
  }

  get createMode(): boolean {
    return this._dialogData.measure === null;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._dialogRef.close(this.measureInput);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
