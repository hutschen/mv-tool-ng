import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Requirement, RequirementService } from '../shared/services/requirement.service';
import { RequirementDialogComponent } from './requirement-dialog.component';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styles: [
    '.data-row:hover { cursor: pointer; background-color: #f5f5f5; }',
  ]
})
export class RequirementTableComponent implements OnInit {
  displayedColumns: string[] = [
    'reference', 'summary', 'description', 'target_object', 'compliance_status', 
    'compliance_comment', 'options'];
  dataSource = new MatTableDataSource<Requirement>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @Input() projectId: number | null = null;
  @Output() requirementClicked = new EventEmitter<Requirement>()

  constructor(
    protected _requirementService: RequirementService, 
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadRequirements()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onRequirementClicked(requirement: Requirement): void {
    this.requirementClicked.emit(requirement)
  }
  
  onCreateRequirement(): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: { projectId: this.projectId, requirement: null }
    })
    dialogRef.afterClosed().subscribe(async requirementInput => {
      if (requirementInput && this.projectId !== null) {
        await this._requirementService.createRequirement(
          this.projectId, requirementInput)
        this.onReloadRequirements()
      }
    })
  }
  onEditRequirement(requirement: Requirement): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: { projectId: this.projectId, requirement: requirement }
    })
    dialogRef.afterClosed().subscribe(async requirementInput => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id, requirementInput)
        this.onReloadRequirements()
      }
    })
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    await this._requirementService.deleteRequirement(requirement.id)
    this.onReloadRequirements()
  }

  onFilterRequirements(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onExportRequirements() {}
  onImportRequirements() {}

  async onReloadRequirements() {
    if(this.projectId !== null) {
      this.dataSource.data = await this._requirementService.listRequirements(
        this.projectId)
    }
  }
}
