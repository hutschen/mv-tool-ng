import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequirementInput, Requirement } from '../shared/services/requirement.service';

export interface IRequirementDialogData {
  projectId: number;
  requirement: Requirement | null;
}

@Component({
  selector: 'mvtool-requirement-dialog',
  templateUrl: './requirement-dialog.component.html',
  styles: [
    'textarea { min-height: 100px; }'
  ]
})
export class RequirementDialogComponent {
  projectId: number;
  requirementInput: IRequirementInput = {
    reference: null,
    summary: '',
    description: null,
    target_object: null,
    compliance_status: null,
    compliance_comment: null,
  }

  constructor(
    protected _dialogRef: MatDialogRef<RequirementDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IRequirementDialogData) { 
      this.projectId = this._dialogData.projectId;
      if (this._dialogData.requirement) {
        this.requirementInput = this._dialogData.requirement.toRequirementInput();
      }
    }

  get createMode(): boolean {
    return this._dialogData.requirement === null;
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this._dialogRef.close(this.requirementInput);
    }
  }

  onCancel(): void {
    this._dialogRef.close(null);
  }
}
