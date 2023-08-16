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

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  IMeasureInput,
  Measure,
  MeasureService,
} from '../shared/services/measure.service';
import {
  IToVerifyItem,
  IVerificationPatch,
  IVerificationService,
  VerificationMethod,
  VerificationStatus,
} from '../shared/verification';
import {
  VerificationMethodOptions,
  VerificationStatusOptions,
} from '../shared/data/custom/custom-options';
import { combineLatest, finalize, firstValueFrom, startWith } from 'rxjs';

export interface IVerificationDialogData {
  toVerifyItem: IToVerifyItem;
  verificationService: IVerificationService;
}

@Injectable({
  providedIn: 'root',
})
export class VerificationDialogService {
  constructor(protected _dialog: MatDialog) {}

  openVerificationDialog(
    toVerifyItem: IToVerifyItem,
    verificationService: IVerificationService
  ): MatDialogRef<VerificationDialogComponent, Measure> {
    const data: IVerificationDialogData = { toVerifyItem, verificationService };
    return this._dialog.open(VerificationDialogComponent, {
      width: '500px',
      data,
    });
  }
}

@Component({
  selector: 'mvtool-verification-dialog',
  template: `
    <!-- Title -->
    <div mat-dialog-title>Edit Verification Status</div>

    <!-- Content -->
    <div mat-dialog-content>
      <form
        id="verificationForm"
        [formGroup]="verificationForm"
        (submit)="onSave()"
      >
        <div class="fx-column">
          <!-- Verification method -->
          <mat-form-field appearance="fill">
            <mat-label>Verification method</mat-label>
            <mat-select formControlName="verificationMethod">
              <mat-option [value]="null">None</mat-option>
              <mat-option
                *ngFor="
                  let option of verificationMethodOptions.filterOptions()
                    | async
                "
                [value]="option.value"
              >
                {{ option.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Verification status -->
          <mat-form-field appearance="fill">
            <mat-label>Verification status</mat-label>
            <mat-select formControlName="verificationStatus">
              <mat-option [value]="null">None</mat-option>
              <mat-option
                *ngFor="
                  let option of verificationStatusOptions.filterOptions()
                    | async
                "
                [value]="option.value"
              >
                {{ option.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Verification comment -->
          <mat-form-field appearance="fill">
            <mat-label>Verification comment</mat-label>
            <textarea matInput formControlName="verificationComment"></textarea>
          </mat-form-field>
        </div>
      </form>

      <!-- Actions -->
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isSaving">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
        <mvtool-loading-overlay [isLoading]="isSaving" color="accent">
          <button
            mat-raised-button
            color="accent"
            type="submit"
            form="verificationForm"
            [disabled]="isSaving || verificationForm.invalid"
          >
            <mat-icon>save</mat-icon>
            Save
          </button>
        </mvtool-loading-overlay>
      </div>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class VerificationDialogComponent implements OnInit {
  verificationMethodOptions = new VerificationMethodOptions(false);
  verificationStatusOptions = new VerificationStatusOptions(false);
  protected _toVerifyItem: IToVerifyItem;
  protected _verificationService: IVerificationService;
  protected _verificationPatch: IVerificationPatch = {};
  verificationForm!: FormGroup;
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<VerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: IVerificationDialogData
  ) {
    this._toVerifyItem = data.toVerifyItem;
    this._verificationService = data.verificationService;
  }

  ngOnInit(): void {
    const methodCtrl = new FormControl(this._toVerifyItem.verification_method);
    const statusCtrl = new FormControl(this._toVerifyItem.verification_status);
    const commentCtrl = new FormControl(this._toVerifyItem.verification_comment); // prettier-ignore
    let preservedStatus = this._toVerifyItem.verification_status;
    let preservedComment = this._toVerifyItem.verification_comment;

    this.verificationForm = new FormGroup({
      verificationMethod: methodCtrl,
      verificationStatus: statusCtrl,
      verificationComment: commentCtrl,
    });

    // React on verification method changes
    methodCtrl.valueChanges
      .pipe(startWith(methodCtrl.value))
      .subscribe((method) => {
        this._verificationPatch.verification_method = method;

        // Enable or disable verification status and comment
        if (method && statusCtrl.disabled && commentCtrl.disabled) {
          statusCtrl.setValue(preservedStatus);
          commentCtrl.setValue(preservedComment);
          statusCtrl.enable();
          commentCtrl.enable();
        } else if (!method && statusCtrl.enabled && commentCtrl.enabled) {
          statusCtrl.disable();
          commentCtrl.disable();
          preservedStatus = statusCtrl.value;
          preservedComment = commentCtrl.value;
          statusCtrl.setValue(null);
          commentCtrl.setValue(null);
        }
      });

    // React on verification status and comment changes
    combineLatest([
      statusCtrl.valueChanges.pipe(startWith(statusCtrl.value)),
      commentCtrl.valueChanges.pipe(startWith(commentCtrl.value)),
    ]).subscribe(([status, comment]) => {
      this._verificationPatch.verification_status = status;
      this._verificationPatch.verification_comment = comment || null;
    });
  }

  async onSave() {
    if (this.verificationForm.invalid) throw new Error('Form is invalid');

    // Define observable to update verification
    const item$ = this._verificationService.patchVerification(
      this._toVerifyItem.id,
      this._verificationPatch
    );

    // Perform update and close dialog
    this.isSaving = true;
    this.verificationForm.disable({ emitEvent: false });
    this._dialogRef.disableClose = true;

    this._dialogRef.close(
      await firstValueFrom(
        item$.pipe(
          finalize(() => {
            this.isSaving = false;
            this.verificationForm.enable({ emitEvent: false });
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
