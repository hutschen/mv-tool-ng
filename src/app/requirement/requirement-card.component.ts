import { Component, Input } from '@angular/core';
import { Requirement } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirement-card',
  template: `
    <div fxLayout="column" *ngIf="requirement">
      <mat-card class="mat-elevation-z0">
        <mat-card-title>
          {{ requirement.reference | truncate:30 }}
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
  styles: []
})
export class RequirementCardComponent {
  @Input() requirement: Requirement | null = null;

  constructor() { }

  get hasContent(): boolean {
    if (this.requirement) {
      return (
        Boolean(this.requirement.description) || 
        Boolean(this.requirement.target_object));
    } else {
      return false;
    }
  }
}
