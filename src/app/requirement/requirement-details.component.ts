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
import { Requirement } from '../shared/services/requirement.service';
import { RequirementInteractionService } from '../shared/services/requirement-interaction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mvtool-requirement-details',
  template: `
    <div
      class="fx-column fx-gap-15 margin-x margin-y"
      *ngIf="requirement$ | async as requirement"
    >
      <!-- Title -->
      <div class="fx-row fx-space-between-center fx-gap-5">
        <h1 class="truncate no-margin">{{ requirement.summary }}</h1>
        <button mat-stroked-button [matMenuTriggerFor]="menu">
          <mat-icon class="no-margin">more_vert</mat-icon>
          <mat-menu #menu="matMenu">
            <button
              mat-menu-item
              (click)="requirementInteractions.onEditRequirement(requirement)"
            >
              <mat-icon>edit_note</mat-icon>
              Edit requirement
            </button>
            <button
              mat-menu-item
              (click)="requirementInteractions.onEditCompliance(requirement)"
            >
              <mat-icon>assured_workload</mat-icon>
              Set compliance status
            </button>
          </mat-menu>
        </button>
      </div>

      <!-- Content -->
      <div class="fx-column fx-gap-5">
        <!-- Reference -->
        <mvtool-detail *ngIf="requirement.reference" label="Reference">
          <div class="truncate">{{ requirement.reference }}</div>
        </mvtool-detail>

        <!-- Catalog Module -->
        <mvtool-detail
          *ngIf="requirement.catalog_requirement"
          label="Catalog Module"
        >
          <div class="truncate">
            {{ requirement.catalog_requirement.catalog_module.reference }}
            {{ requirement.catalog_requirement.catalog_module.title }}
          </div>
        </mvtool-detail>

        <!-- Description -->
        <mvtool-detail *ngIf="requirement.description" label="Description">
          <div>{{ requirement.description }}</div>
        </mvtool-detail>

        <!-- GS Absicherung -->
        <mvtool-detail *ngIf="requirement.gsAbsicherung" label="GS Absicherung">
          <div class="truncate">
            {{ requirement.gsAbsicherung }}
          </div>
        </mvtool-detail>

        <!-- GS Verantwortliche -->
        <mvtool-detail
          *ngIf="requirement.gsVerantwortliche"
          label="GS Verantwortliche"
        >
          <div class="truncate">
            {{ requirement.gsVerantwortliche }}
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
  styleUrls: [
    '../shared/styles/flex.scss',
    '../shared/styles/truncate.scss',
    '../shared/styles/spacing.scss',
  ],
  styles: [],
})
export class RequirementDetailsComponent {
  requirement$?: Observable<Requirement>;

  constructor(
    readonly requirementInteractions: RequirementInteractionService
  ) {}

  @Input()
  set requirement(requirement: Requirement) {
    this.requirement$ =
      this.requirementInteractions.syncRequirement(requirement);
  }
}
