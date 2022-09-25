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

@Component({
  selector: 'mvtool-requirement-card',
  template: `
    <div *ngIf="requirement" fxLayout="column" fxLayoutGap="5px">
      <!-- Title -->
      <div
        fxLayout="row"
        fxLayoutAlign="space-between center"
        fxLayoutGap="5px"
      >
        <h1 class="truncate">{{ requirement.summary }}</h1>
        <button mat-stroked-button>
          <mat-icon>edit</mat-icon>
          Edit Requirement
        </button>
      </div>

      <!-- Reference -->
      <mvtool-detail *ngIf="requirement.reference" label="Reference">
        <div class="truncate">{{ requirement.reference }}</div>
      </mvtool-detail>

      <!-- GS Anforderung Reference -->
      <mvtool-detail
        *ngIf="requirement.gs_anforderung_reference"
        label="GS Anforderung Reference"
      >
        <div class="truncate">{{ requirement.gs_anforderung_reference }}</div>
      </mvtool-detail>

      <!-- GS Baustein -->
      <mvtool-detail *ngIf="requirement.gs_baustein" label="GS Baustein">
        <div class="truncate">
          {{ requirement.gs_baustein.reference }}
          {{ requirement.gs_baustein.title }}
        </div>
      </mvtool-detail>

      <!-- Description -->
      <mvtool-detail *ngIf="requirement.description" label="Description">
        <div>{{ requirement.description }}</div>
      </mvtool-detail>

      <!-- GS Absicherung -->
      <mvtool-detail *ngIf="requirement.gs_absicherung" label="GS Absicherung">
        <div class="truncate">{{ requirement.gs_absicherung }}</div>
      </mvtool-detail>

      <!-- GS Verantwortliche -->
      <mvtool-detail
        *ngIf="requirement.gs_verantwortliche"
        label="GS Verantwortliche"
      >
        <div class="truncate">{{ requirement.gs_verantwortliche }}</div>
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
  `,
  styles: [],
})
export class RequirementCardComponent {
  @Input() requirement: Requirement | null = null;

  constructor() {}

  get hasContent(): boolean {
    if (this.requirement) {
      return (
        Boolean(this.requirement.description) ||
        Boolean(this.requirement.target_object)
      );
    } else {
      return false;
    }
  }
}
