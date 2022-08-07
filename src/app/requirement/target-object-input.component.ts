import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from '../shared/services/project.service';
import { RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-target-object-input',
  template: `
    <div fxLayout="column">
      <mat-form-field appearance="fill">
        <mat-label>Target object</mat-label>
        <input
          type="text"
          matInput
          [(ngModel)]="filterValue"
          [matAutocomplete]="auto"
        />
        <mat-autocomplete #auto="matAutocomplete">
          <mat-option
            *ngFor="let targetObject of filteredTargetObjects"
            [value]="targetObject"
          >
            {{ targetObject }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styles: [],
})
export class TargetObjectInputComponent implements OnInit {
  @Input() project: Project | null = null;
  @Input() targetObject: string | null = null;
  @Output() targetObjectChange = new EventEmitter<string | null>();
  targetObjects: string[] = [];
  filteredTargetObjects: string[] = [];

  constructor(protected _requirementService: RequirementService) {}

  async ngOnInit(): Promise<void> {
    if (this.project) {
      const requirements = await this._requirementService.listRequirements(
        this.project.id
      );
      this.targetObjects = <string[]>requirements
        .map(
          (r) => r.target_object // collect all target objects
        )
        .filter(
          (to) => to !== null // remove nulls
        )
        .filter(
          (to, index, self) => self.indexOf(to) === index // remove duplicates
        );
    }
  }

  get filterValue(): string | null {
    return this.targetObject;
  }

  set filterValue(filterValue: string | null) {
    if (filterValue !== null) {
      this.filteredTargetObjects = this._filter(filterValue);
    }
    this.targetObject = filterValue;
    this.targetObjectChange.emit(filterValue);
  }

  protected _filter(filterValue: string) {
    return this.targetObjects.filter((to) =>
      to.toLowerCase().includes(filterValue.toLowerCase())
    );
  }
}
