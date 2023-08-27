import { Component, Inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { JiraIssueService } from '../shared/services/jira-issue.service';
import { JiraIssueOptions } from '../shared/data/jira-issue/jira-issue-options';
import { Measure, MeasureService } from '../shared/services/measure.service';
import { finalize, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JiraIssueSelectDialogService {
  constructor(protected _dialog: MatDialog) {}

  openJiraIssueSelectDialog(
    measure: Measure
  ): MatDialogRef<JiraIssueSelectDialogComponent, Measure> {
    return this._dialog.open(JiraIssueSelectDialogComponent, {
      width: '500px',
      data: measure,
    });
  }
}

@Component({
  selector: 'mvtool-jira-issue-select-dialog',
  template: `
    <!-- Title -->
    <div mat-dialog-title>Select JIRA Issue</div>

    <!-- Content -->
    <div mat-dialog-content>
      <form
        id="jiraIssueSelectForm"
        #jiraIssueSelectForm="ngForm"
        (submit)="onSave(jiraIssueSelectForm)"
        class="fx-column"
      >
        <mvtool-options-input
          name="jira_issue_id"
          label="JIRA Issue"
          placeholder="Select JIRA Issue"
          [options]="jiraIssueOptions"
          [(ngModel)]="jiraIssueId"
          [disabled]="isSaving"
          required
        ></mvtool-options-input>
      </form>
    </div>

    <!-- Actions -->
    <div mat-dialog-actions align="end">
      <button mat-button class="form-button" (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
        Cancel
      </button>
      <mvtool-loading-overlay [isLoading]="isSaving" color="accent">
        <button
          [disabled]="jiraIssueSelectForm.invalid"
          mat-raised-button
          class="form-button"
          color="accent"
          type="submit"
          form="jiraIssueSelectForm"
          [disabled]="isSaving"
        >
          <mat-icon>save</mat-icon>
          Save
        </button>
      </mvtool-loading-overlay>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: ['.loading-spinner { margin-right: 8px; }'],
})
export class JiraIssueSelectDialogComponent {
  jiraIssueOptions: JiraIssueOptions;
  jiraIssueId: string | null = null;
  isSaving: boolean = false;

  constructor(
    protected _jiraIssueService: JiraIssueService,
    protected _measureService: MeasureService,
    protected _dialogRef: MatDialogRef<JiraIssueSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected _measure: Measure
  ) {
    if (_measure.requirement.project.jira_project == null) {
      throw new Error('measure.requirement.project.jira_project is null');
    }

    this.jiraIssueOptions = new JiraIssueOptions(
      this._jiraIssueService,
      _measure.requirement.project.jira_project,
      false
    );
  }

  async onSave(form: NgForm) {
    if (!form.valid) throw new Error('form is invalid');

    // Define observable to patch measure
    const measure$ = this._measureService.patchMeasure(this._measure.id, {
      jira_issue_id: this.jiraIssueId,
    });

    // Perform patch and close dialog
    this.isSaving = true;
    this._dialogRef.disableClose = true;

    this._dialogRef.close(
      await firstValueFrom(
        measure$.pipe(
          finalize(() => {
            this.isSaving = false;
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
