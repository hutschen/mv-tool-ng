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

import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Requirement } from '../shared/services/requirement.service';
import { ComplianceDialogComponent } from './compliance-dialog.component';
import {
  IRequirementDialogData,
  RequirementDialogComponent,
} from './requirement-dialog.component';

@Component({
  selector: 'mvtool-requirement-card',
  template: `
    <div
      class="requirement-card"
      *ngIf="requirement"
      fxLayout="column"
      fxLayoutGap="15px"
    >
      <!-- Title -->
      <div
        fxLayout="row"
        fxLayoutAlign="space-between center"
        fxLayoutGap="5px"
      >
        <h1 class="truncate">{{ requirement.summary }}</h1>
        <button mat-stroked-button [matMenuTriggerFor]="menu">
          <mat-icon>more_vert</mat-icon>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="onEditRequirement()">
              <mat-icon>edit_note</mat-icon>
              Edit Requirement
            </button>
            <button mat-menu-item (click)="onEditCompliance()">
              <mat-icon>edit_note</mat-icon>Set Compliance
            </button>
          </mat-menu>
        </button>
      </div>

      <!-- Content -->
      <div fxLayout="column" fxLayoutGap="5px">
        <!-- Reference -->
        <mvtool-detail *ngIf="requirement.reference" label="Reference">
          <div class="truncate">{{ requirement.reference }}</div>
        </mvtool-detail>

        <!-- GS Anforderung Reference -->
        <mvtool-detail
          *ngIf="requirement.catalog_requirement?.gs_anforderung_reference"
          label="GS Anforderung Reference"
        >
          <div class="truncate">
            {{ requirement.catalog_requirement?.gs_anforderung_reference }}
          </div>
        </mvtool-detail>

        <!-- Catalog Module -->
        <mvtool-detail
          *ngIf="requirement.catalog_requirement"
          label="Catalog Module"
        >
          <div class="truncate">
            {{ requirement.catalog_requirement.catalog_module.reference }}
            {{ requirement.catalog_requirement.catalog_module.gs_reference }}
            {{ requirement.catalog_requirement.catalog_module.title }}
          </div>
        </mvtool-detail>

        <!-- Description -->
        <mvtool-detail *ngIf="requirement.description" label="Description">
          <div>{{ requirement.description }}</div>
        </mvtool-detail>

        <!-- GS Absicherung -->
        <mvtool-detail
          *ngIf="requirement.catalog_requirement?.gs_absicherung"
          label="GS Absicherung"
        >
          <div class="truncate">
            {{ requirement.catalog_requirement?.gs_absicherung }}
          </div>
        </mvtool-detail>

        <!-- GS Verantwortliche -->
        <mvtool-detail
          *ngIf="requirement.catalog_requirement?.gs_verantwortliche"
          label="GS Verantwortliche"
        >
          <div class="truncate">
            {{ requirement.catalog_requirement?.gs_verantwortliche }}
          </div>
        </mvtool-detail>

        <!-- Target object -->
        <mvtool-detail *ngIf="requirement.target_object" label="Target Object">
          <div class="truncate">{{ requirement.target_object }}</div>
        </mvtool-detail>

        <!-- Compliance status -->
        <mvtool-detail
          *ngIf="requirement.compliance_status"
          label="Compliance status"
        >
          <div class="truncate">{{ requirement.compliance_status }}</div>
        </mvtool-detail>

        <!-- Compliance comment -->
        <mvtool-detail
          *ngIf="requirement.compliance_comment"
          label="Compliance Comment"
        >
          <div>{{ requirement.compliance_comment }}</div>
        </mvtool-detail>
      </div>
    </div>
  `,
  styles: ['h1 { margin: 0; }', '.requirement-card { margin: 20px; }'],
})
export class RequirementCardComponent {
  @Input() requirement: Requirement | null = null;

  constructor(protected _dialog: MatDialog) {}

  onEditRequirement(): void {
    const dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: {
        project: this.requirement?.project,
        requirement: this.requirement,
      } as IRequirementDialogData,
    });
    dialogRef.afterClosed().subscribe((requirement: Requirement | null) => {
      if (requirement) {
        this.requirement = requirement;
      }
    });
  }

  onEditCompliance(): void {
    const dialogRef = this._dialog.open(ComplianceDialogComponent, {
      width: '500px',
      data: this.requirement as Requirement,
    });
    dialogRef
      .afterClosed()
      .subscribe(async (requirement: Requirement | null) => {
        if (requirement) {
          this.requirement = requirement;
        }
      });
  }
}
