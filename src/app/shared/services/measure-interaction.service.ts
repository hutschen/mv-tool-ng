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

import { Injectable } from '@angular/core';
import {
  CompletionStatus,
  Measure,
  MeasureService,
  VerificationMethod,
  VerificationStatus,
} from './measure.service';
import { MeasureDialogService } from 'src/app/measure/measure-dialog.component';
import { ComplianceDialogService } from '../components/compliance-dialog.component';
import { CompletionDialogService } from 'src/app/measure/completion-dialog.component';
import { VerificationDialogService } from 'src/app/measure/verification-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';
import { ComplianceStatus, Requirement } from './requirement.service';
import { Observable, Subject, firstValueFrom, tap } from 'rxjs';
import { Interaction, InteractionService } from '../data/interaction';
import { ComplianceInteractionService } from '../compliance-interaction';

@Injectable({
  providedIn: 'root',
})
export class MeasureInteractionService
  implements InteractionService<Measure>, ComplianceInteractionService
{
  protected _interactionsSubject = new Subject<Interaction<Measure>>();
  readonly interactions$ = this._interactionsSubject.asObservable();

  constructor(
    protected _measureService: MeasureService,
    protected _measureDialogService: MeasureDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _completionDialogService: CompletionDialogService,
    protected _verificationDialogService: VerificationDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  onQuickAddMeasure(
    requirement: Requirement,
    summary: string
  ): Observable<Measure> {
    return this._measureService
      .createMeasure(requirement.id, { summary })
      .pipe(
        tap((measure) =>
          this._interactionsSubject.next({ item: measure, action: 'quickAdd' })
        )
      );
  }

  protected async _createOrEditMeasure(
    requirement: Requirement,
    measure?: Measure
  ): Promise<void> {
    const dialogRef = this._measureDialogService.openMeasureDialog(
      requirement,
      measure
    );
    const resultingMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (resultingMeasure) {
      this._interactionsSubject.next({
        item: resultingMeasure,
        action: measure ? 'update' : 'add',
      });
    }
  }

  async onCreateMeasure(requirement: Requirement): Promise<void> {
    await this._createOrEditMeasure(requirement);
  }

  async onEditMeasure(measure: Measure): Promise<void> {
    await this._createOrEditMeasure(measure.requirement, measure);
  }

  async onEditCompliance(measure: Measure): Promise<void> {
    const dialogRef =
      this._complianceDialogService.openComplianceDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this._interactionsSubject.next({
        item: updatedMeasure as Measure,
        action: 'update',
      });
    }
  }

  async onEditCompletion(measure: Measure): Promise<void> {
    const dialogRef =
      this._completionDialogService.openCompletionDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this._interactionsSubject.next({
        item: updatedMeasure,
        action: 'update',
      });
    }
  }

  async onEditVerification(measure: Measure): Promise<void> {
    const dialogRef =
      this._verificationDialogService.openVerificationDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this._interactionsSubject.next({
        item: updatedMeasure,
        action: 'update',
      });
    }
  }

  async onDeleteMeasure(measure: Measure): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Measure',
      `Do you really want to delete measure "${measure.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._measureService.deleteMeasure(measure.id));
      this._interactionsSubject.next({ item: measure, action: 'delete' });
    }
  }

  async onSetComplianceStatus(
    measure: Measure,
    complianceStatus: ComplianceStatus | null
  ) {
    const measureInput = measure.toMeasureInput();
    measureInput.compliance_status = complianceStatus;
    this._interactionsSubject.next({
      item: await firstValueFrom(
        this._measureService.updateMeasure(measure.id, measureInput)
      ),
      action: 'update',
    });
  }

  async onSetCompletionStatus(
    measure: Measure,
    completionStatus: CompletionStatus | null
  ) {
    const measureInput = measure.toMeasureInput();
    measureInput.completion_status = completionStatus;
    this._interactionsSubject.next({
      item: await firstValueFrom(
        this._measureService.updateMeasure(measure.id, measureInput)
      ),
      action: 'update',
    });
  }

  async onSetVerificationMethod(
    measure: Measure,
    verificationMethod: VerificationMethod | null
  ) {
    const measureInput = measure.toMeasureInput();
    measureInput.verification_method = verificationMethod;
    this._interactionsSubject.next({
      item: await firstValueFrom(
        this._measureService.updateMeasure(measure.id, measureInput)
      ),
      action: 'update',
    });
  }

  async onSetVerificationStatus(
    measure: Measure,
    verificationStatus: VerificationStatus | null
  ) {
    const measureInput = measure.toMeasureInput();
    measureInput.verification_status = verificationStatus;
    this._interactionsSubject.next({
      item: await firstValueFrom(
        this._measureService.updateMeasure(measure.id, measureInput)
      ),
      action: 'update',
    });
  }
}
