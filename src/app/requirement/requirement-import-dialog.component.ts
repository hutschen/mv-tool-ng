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

import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, map, merge, Observable } from 'rxjs';
import {
  CatalogModule,
  CatalogModuleService,
} from '../shared/services/catalog-module.service';
import { Catalog, CatalogService } from '../shared/services/catalog.service';
import { Project } from '../shared/services/project.service';

interface INode {
  name: string;
  level: number;
  expandable: boolean;
  isLoaded: boolean;
}

class CatalogModuleNode implements INode {
  name: string;
  level = 1;
  expandable = false;
  isLoaded = true;

  constructor(public catalogModule: CatalogModule) {
    this.name = catalogModule.title;
  }
}

class CatalogNode implements INode {
  name: string;
  level = 0;
  expandable = true;
  isLoaded = false;

  constructor(
    public catalog: Catalog,
    protected _catalogModuleService: CatalogModuleService
  ) {
    this.name = catalog.title;
  }

  async loadChildren(): Promise<CatalogModuleNode[]> {
    this.isLoaded = true;
    const catalogModules = await this._catalogModuleService.listCatalogModules(
      this.catalog.id
    );
    this.isLoaded = false;
    return catalogModules.map(
      (catalogModule) => new CatalogModuleNode(catalogModule)
    );
  }
}

// Implemented according to examples from https://material.angular.io/components/tree/examples
class CatalogDataSource implements DataSource<INode> {
  dataChange = new BehaviorSubject<INode[]>([]);

  get data(): INode[] {
    return this.dataChange.value;
  }

  set data(value: INode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    protected _treeControl: FlatTreeControl<INode>,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<INode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if (change.added || change.removed) {
        this.handleTreeControl(change);
      }
    });
    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  handleTreeControl(change: SelectionChange<INode>): void {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  async toggleNode(node: INode, expand: boolean): Promise<void> {
    const index = this.data.indexOf(node);
    if (index < 0) {
      // cannot find the node
      return;
    }
    if (node.expandable) {
      if (expand) {
        const nodes = await (node as CatalogNode).loadChildren();
        this.data.splice(index + 1, 0, ...nodes);
      } else {
        let count = 0;
        for (
          let i = index + 1;
          i < this.data.length && this.data[i].level > node.level;
          i++, count++
        ) {}
        this.data.splice(index + 1, count);
      }
      this.dataChange.next(this.data);
    }
  }
}

// Implemented according to examples from https://material.angular.io/components/tree/examples
@Component({
  selector: 'mvtool-requirement-import-dialog',
  template: `
    <div mat-dialog-title><h1>Import requirements from catalogs</h1></div>
    <div mat-dialog-content>
      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
        <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
          <button mat-icon-button disabled></button>
          {{ node.name }}
        </mat-tree-node>
        <mat-tree-node
          *matTreeNodeDef="let node; when: hasChild"
          matTreeNodePadding
        >
          <button
            mat-icon-button
            matTreeNodeToggle
            [attr.aria-label]="'toggle ' + node.name"
          >
            <mat-icon class="mat-icon-rtl-mirror">
              {{
                treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'
              }}
            </mat-icon>
          </button>
          {{ node.name }}
          <mat-progress-bar
            *ngIf="node.isLoaded"
            mode="indeterminate"
            class="progress-bar"
          ></mat-progress-bar>
        </mat-tree-node>
      </mat-tree>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="accent" (click)="onImport()">
        Import
      </button>
    </div>
  `,
  styles: ['.progress-bar { margin-left: 30px; }'],
})
export class RequirementImportDialogComponent implements OnInit {
  treeControl: FlatTreeControl<INode>;
  dataSource: CatalogDataSource;

  constructor(
    protected _dialogRef: MatDialogRef<RequirementImportDialogComponent>,
    protected _catalogService: CatalogService,
    protected _catalogModuleService: CatalogModuleService,
    @Inject(MAT_DIALOG_DATA) protected _project: Project
  ) {
    this.treeControl = new FlatTreeControl<INode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new CatalogDataSource(
      this.treeControl,
      this._catalogService,
      this._catalogModuleService
    );
  }

  // load catalogs and catalog modules
  async ngOnInit(): Promise<void> {
    const catalogs = await this._catalogService.listCatalogs();
    this.dataSource.data = catalogs.map(
      (catalog) => new CatalogNode(catalog, this._catalogModuleService)
    );
  }

  onImport(): void {}

  onCancel(): void {
    this._dialogRef.close();
  }

  getLevel = (node: INode) => node.level;

  isExpandable = (node: INode) => node.expandable;

  hasChild = (_: number, _nodeData: INode) => _nodeData.expandable;
}
