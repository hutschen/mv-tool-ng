import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Requirement, RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styleUrls: ['./requirement-table.component.css']
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

  async ngOnInit() {
    if(this.projectId !== null) {
      this.dataSource.data = await this._requirementService.listRequirements(
        this.projectId)
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  onCreateRequirement() {}
  onEditRequirement(requirement: Requirement): void {}
  async onDeleteRequirement(requirement: Requirement): Promise<void> {}
  onFilterRequirements(event: Event) {}
  onExportRequirements() {}
  onImportRequirements() {}
}
