import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { stringToKeyValue } from '@angular/flex-layout/extended/style/style-transforms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { ComplianceDialogComponent } from './compliance-dialog.component';
import {
  IRequirementDialogData,
  RequirementDialogComponent,
} from './requirement-dialog.component';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styles: [],
})
export class RequirementTableComponent implements OnInit {
  _displayedColumns: string[] = [
    'reference',
    'summary',
    'description',
    'target_object',
    'compliance_status',
    'compliance_comment',
    'completion',
    'options',
  ];
  data: Requirement[] = [];
  dataLoaded: boolean = false;
  @Input() project: Project | null = null;
  @Output() requirementClicked = new EventEmitter<Requirement>();

  constructor(
    protected _requirementService: RequirementService,
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadRequirements();
    this.dataLoaded = true;
  }

  get displayedColumns(): string[] {
    let displayFlags = new Map<string, boolean>([
      ['reference', false],
      ['summary', false],
      ['description', false],
      ['target_object', false],
      ['compliance_status', false],
      ['compliance_comment', false],
      ['completion', false],
      ['options', true],
    ]);

    for (let requirement of this.data) {
      if (requirement.reference) {
        displayFlags.set('reference', true);
      }
      if (requirement.summary) {
        displayFlags.set('summary', true);
      }
      if (requirement.description) {
        displayFlags.set('description', true);
      }
      if (requirement.target_object) {
        displayFlags.set('target_object', true);
      }
      if (requirement.compliance_status) {
        displayFlags.set('compliance_status', true);
      }
      if (requirement.compliance_comment) {
        displayFlags.set('compliance_comment', true);
      }
      if (requirement.completion) {
        displayFlags.set('completion', true);
      }
    }
    // return display columns. A column should be displayed if its flag is true
    let displayedColumns: string[] = [];
    for (let columnName of displayFlags.keys()) {
      if (displayFlags.get(columnName)) {
        displayedColumns.push(columnName);
      }
    }
    return displayedColumns;
  }

  onCreateRequirement(): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        requirement: null,
      } as IRequirementDialogData,
    });
    dialogRef.afterClosed().subscribe(async (requirementInput) => {
      if (requirementInput && this.project) {
        await this._requirementService.createRequirement(
          this.project.id,
          requirementInput
        );
        this.onReloadRequirements();
      }
    });
  }
  onEditRequirement(requirement: Requirement): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        requirement: requirement,
      } as IRequirementDialogData,
    });
    dialogRef.afterClosed().subscribe(async (requirementInput) => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id,
          requirementInput
        );
        this.onReloadRequirements();
      }
    });
  }

  onEditCompliance(requirement: Requirement): void {
    let dialogRef = this._dialog.open(ComplianceDialogComponent, {
      width: '500px',
      data: requirement,
    });
    dialogRef.afterClosed().subscribe(async (requirementInput) => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id,
          requirementInput
        );
        this.onReloadRequirements();
      }
    });
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    await this._requirementService.deleteRequirement(requirement.id);
    this.onReloadRequirements();
  }

  onExportRequirements() {}
  onImportRequirements() {}

  async onReloadRequirements() {
    if (this.project) {
      this.data = await this._requirementService.listRequirements(
        this.project.id
      );
    }
  }
}
