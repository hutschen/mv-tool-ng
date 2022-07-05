import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequirement, IRequirementInput, Requirement, RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-compliance-dialog',
  templateUrl: './compliance-dialog.component.html',
  styles: [
    'textarea { min-height: 100px; }'
  ]
})
export class ComplianceDialogComponent {
  requirementInput: IRequirementInput;

  constructor(
    protected _dialogRef: MatDialogRef<ComplianceDialogComponent>, 
    protected _requirementService: RequirementService,
    @Inject(MAT_DIALOG_DATA) protected _requirement: Requirement) { 
      this.requirementInput = this._requirement.toRequirementInput();
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
