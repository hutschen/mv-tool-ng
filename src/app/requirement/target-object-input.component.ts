import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-target-object-input',
  templateUrl: './target-object-input.component.html',
  styles: [
  ]
})
export class TargetObjectInputComponent implements OnInit {
  @Input() projectId: number | null = null;
  @Input() targetObject: string | null = null;
  @Output() targetObjectChange = new EventEmitter<string | null>();
  targetObjects: string[] = [];
  filteredTargetObjects: string[] = [];

  constructor(protected _requirementService: RequirementService) { }

  async ngOnInit(): Promise<void> {
    if (this.projectId) {
      const requirements = await this._requirementService.listRequirements(
        this.projectId);
      this.targetObjects = <string[]> requirements.map(
          r => r.target_object // collect all target objects
        ).filter(
          to => to !== null // remove nulls
        ).filter(
          (to, index, self) => self.indexOf(to) === index); // remove duplicates
    }
  }

  get filterValue(): string | null {
    return this.targetObject;
  }

  set filterValue(filterValue: string | null) {
    if (filterValue !== null) {
      this.filteredTargetObjects = this._filter(filterValue);
    }
    this.targetObject = filterValue
    this.targetObjectChange.emit(filterValue)
  }

  protected _filter(filterValue: string) {
    return this.targetObjects.filter(
      to => to.toLowerCase().includes(filterValue.toLowerCase()));
  }
}
