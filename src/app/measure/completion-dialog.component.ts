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
import {
  ICompletionPatch,
  ICompletionService,
  IToCompleteItem,
} from '../shared/completion';
import { CompletionStatusOptions } from '../shared/data/custom/custom-options';
import { finalize, firstValueFrom, startWith } from 'rxjs';

export interface ICompletionDialogData {
  toCompleteItem: IToCompleteItem;
  completionService: ICompletionService;
}

@Injectable({
  providedIn: 'root',
})
export class CompletionDialogService {
  constructor(protected _dialog: MatDialog) {}

  openCompletionDialog(
    toCompleteItem: IToCompleteItem,
    completionService: ICompletionService
  ): MatDialogRef<CompletionDialogComponent, IToCompleteItem> {
    const data: ICompletionDialogData = { toCompleteItem, completionService };
    return this._dialog.open(CompletionDialogComponent, {
      width: '500px',
      data,
    });
  }
}

@Component({
  selector: 'mvtool-completion-dialog',
  template: `
    <!-- Title -->
    <div mat-dialog-title>Edit Completion</div>

    <div mat-dialog-content>
      <form
        id="completionForm"
        (submit)="onSave()"
        [formGroup]="completionForm"
      >
        <div class="fx-column">
          <!-- Completion status -->
          <mat-form-field appearance="fill">
            <mat-label>Select completion status</mat-label>
            <mat-select formControlName="completionStatus">
              <mat-option [value]="null">None</mat-option>
              <mat-option
                *ngFor="
                  let option of completionStatusOptions.filterOptions() | async
                "
                [value]="option.value"
              >
                {{ option.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Completion comment -->
          <mat-form-field appearance="fill">
            <mat-label>Completion comment</mat-label>
            <textarea matInput formControlName="completionComment"></textarea>
          </mat-form-field>
        </div>
      </form>
    </div>

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
          form="completionForm"
          [disabled]="isSaving || completionForm.invalid"
        >
          <mat-icon>save</mat-icon>
          Save
        </button>
      </mvtool-loading-overlay>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['textarea { min-height: 100px; }'],
})
export class CompletionDialogComponent implements OnInit {
  readonly completionStatusOptions = new CompletionStatusOptions(false);
  protected _toCompleteItem: IToCompleteItem;
  protected _completionService: ICompletionService;
  protected _completionPatch: ICompletionPatch = {};
  completionForm!: FormGroup;
  isSaving: boolean = false;

  constructor(
    protected _dialogRef: MatDialogRef<CompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ICompletionDialogData
  ) {
    this._toCompleteItem = data.toCompleteItem;
    this._completionService = data.completionService;
  }

  ngOnInit(): void {
    const statusCtrl = new FormControl(this._toCompleteItem.completion_status);
    const commentCtrl = new FormControl(this._toCompleteItem.completion_comment); // prettier-ignore
    let preservedComment = this._toCompleteItem.completion_comment;

    this.completionForm = new FormGroup({
      completionStatus: statusCtrl,
      completionComment: commentCtrl,
    });

    // React on completion status changes
    statusCtrl.valueChanges
      .pipe(startWith(statusCtrl.value))
      .subscribe((status) => {
        // Update completion status
        this._completionPatch.completion_status = status;

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

    // React on comment changes
    commentCtrl.valueChanges
      .pipe(startWith(commentCtrl.value))
      .subscribe((comment) => {
        // Update completion comment
        this._completionPatch.completion_comment = comment || null;
      });
  }

  async onSave() {
    if (this.completionForm.invalid) throw new Error('Form is invalid');

    // Define observable to update completion
    const item$ = this._completionService.patchCompletion(
      this._toCompleteItem.id,
      this._completionPatch
    );

    // Perform update and close dialog
    this.isSaving = true;
    this.completionForm.disable({ emitEvent: false });
    this._dialogRef.disableClose = true;

    this._dialogRef.close(
      await firstValueFrom(
        item$.pipe(
          finalize(() => {
            this.isSaving = false;
            this.completionForm.enable({ emitEvent: false });
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
