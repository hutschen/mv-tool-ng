import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequirementInput, Requirement, RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirement-dialog',
  templateUrl: './requirement-dialog.component.html',
  styles: [
    'textarea { min-height: 100px; }'
  ]
})
export class RequirementDialogComponent implements OnInit {
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
    protected _requirementService: RequirementService,
    @Inject(MAT_DIALOG_DATA) protected _requirement: Requirement | null) { }

  ngOnInit(): void {
    if (this._requirement) {
      this.requirementInput = {
        reference: this._requirement.reference,
        summary: this._requirement.summary,
        description: this._requirement.description,
        target_object: this._requirement.target_object,
        compliance_status: this._requirement.compliance_status,
        compliance_comment: this._requirement.compliance_comment,
      }
    }
  }

  get createMode(): boolean {
    return this._requirement === null;
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
