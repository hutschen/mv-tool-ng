// Copyright (C) 2023 Helmar Hutschenreuter
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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ComplianceStatusOptions } from '../data/custom/custom-options';
import { Observable, finalize, firstValueFrom, map, startWith } from 'rxjs';
import {
  ComplianceStatus,
  ICompliancePatch,
  IComplianceService,
  ICompliantItem,
} from '../compliance';

export interface IComplianceDialogData {
  compliantItem: ICompliantItem;
  complianceService: IComplianceService;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceDialogService {
  constructor(protected _dialog: MatDialog) {}

  openComplianceDialog(
    compliantItem: ICompliantItem,
    complianceService: IComplianceService
  ): MatDialogRef<ComplianceDialogComponent, ICompliantItem> {
    const dialogRef = this._dialog.open(ComplianceDialogComponent, {
      width: '500px',
      data: { compliantItem, complianceService },
    });
    return dialogRef;
  }
}

@Component({
  selector: 'mvtool-compliance-dialog',
  templateUrl: './compliance-dialog.component.html',
  styleUrls: ['../styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class ComplianceDialogComponent implements OnInit {
  readonly complianceStatusOptions = new ComplianceStatusOptions(false);
  protected _compliantItem: ICompliantItem;
  protected _complianceService: IComplianceService;
  protected _compliancePatch: ICompliancePatch = {};
  complianceStatusHint$!: Observable<ComplianceStatus | null>;
  complianceForm!: FormGroup;
  isSaving = false;

  constructor(
    protected _dialogRef: MatDialogRef<ComplianceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: IComplianceDialogData
  ) {
    this._compliantItem = data.compliantItem;
    this._complianceService = data.complianceService;
  }

  ngOnInit(): void {
    const statusCtrl = new FormControl(this._compliantItem.compliance_status);
    const commentCtrl = new FormControl(this._compliantItem.compliance_comment);
    let preservedComment = this._compliantItem.compliance_comment;

    this.complianceForm = new FormGroup({
      complianceStatus: statusCtrl,
      complianceComment: commentCtrl,
    });

    // Define observable for compliance status hint
    this.complianceStatusHint$ = statusCtrl.valueChanges.pipe(
      startWith(statusCtrl.value),
      map((status) => {
        const hint = this._compliantItem.compliance_status_hint;
        if (!hint || !status || status === hint) return null;
        else return hint;
      })
    );

    // React to changes in compliance status
    statusCtrl.valueChanges
      .pipe(startWith(statusCtrl.value))
      .subscribe((status) => {
        this._compliancePatch.compliance_status = status;

        // Enable or disable commentCtrl
        if (status && commentCtrl.disabled) {
          commentCtrl.setValue(preservedComment);
          commentCtrl.enable();
        } else if (!status && commentCtrl.enabled) {
          commentCtrl.disable();
          preservedComment = commentCtrl.value;
          commentCtrl.setValue(null);
        }
      });

    // React to changes in compliance comment
    commentCtrl.valueChanges
      .pipe(startWith(commentCtrl.value))
      .subscribe((comment) => {
        this._compliancePatch.compliance_comment = comment || null;
      });
  }

  async onSave() {
    if (this.complianceForm.invalid) throw new Error('Form is invalid');

    // Define observable to update requirement or measure
    const item$ = this._complianceService.patchCompliance(
      this._compliantItem.id,
      this._compliancePatch
    );

    // Perform update and close dialog
    this.isSaving = true;
    this.complianceForm.disable({ emitEvent: false });
    this._dialogRef.disableClose = true;

    this._dialogRef.close(
      await firstValueFrom(
        item$.pipe(
          finalize(() => {
            this.isSaving = false;
            this.complianceForm.enable({ emitEvent: false });
            this._dialogRef.disableClose = false;
          })
        )
      )
    );
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
