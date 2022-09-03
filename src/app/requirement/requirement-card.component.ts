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
    <div fxLayout="column" *ngIf="requirement">
      <mat-card class="mat-elevation-z0">
        <mat-card-title>
          {{ requirement.reference | truncate: 30 }}
          {{ requirement.summary | truncate }}
        </mat-card-title>
        <mat-card-content *ngIf="hasContent">
          <p>{{ requirement.description }}</p>
          <p *ngIf="requirement.target_object">
            <strong>Target object:</strong>
            {{ requirement.target_object }}
          </p>
          <p *ngIf="requirement.compliance_status">
            <strong>Compliance status:</strong>
            {{ requirement.compliance_status }}
          </p>
          <p *ngIf="requirement.compliance_comment">
            <strong>Compliance comment:</strong>
            {{ requirement.compliance_comment }}
          </p>
        </mat-card-content>
      </mat-card>
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
