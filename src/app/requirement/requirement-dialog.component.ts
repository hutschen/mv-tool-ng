import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequirementInput, Requirement, RequirementService } from '../shared/services/requirement.service';

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
export class RequirementDialogComponent implements OnInit {
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
    protected _requirementService: RequirementService,
    @Inject(MAT_DIALOG_DATA) protected _dialogData: IRequirementDialogData) { 
      this.projectId = _dialogData.projectId;
    }

  ngOnInit(): void {
    const requirement = this._dialogData.requirement;
    if (requirement) {
      this.requirementInput = {
        reference: requirement.reference,
        summary: requirement.summary,
        description: requirement.description,
        target_object: requirement.target_object,
        compliance_status: requirement.compliance_status,
        compliance_comment: requirement.compliance_comment,
      }
    }
  }

  get createMode(): boolean {
    return this._dialogData === null;
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
