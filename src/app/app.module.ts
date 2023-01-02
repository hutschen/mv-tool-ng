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

import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { ProjectModule } from './project/project.module';
import { MaterialModule } from './material/material.module';
import { UserModule } from './user/user.module';
import { AppToolbarComponent } from './app-toolbar.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { JiraProjectModule } from './jira-project/jira-project.module';
import { RequirementModule } from './requirement/requirement.module';
import { SharedModule } from './shared/shared.module';
import { CatalogIdGuard, CatalogModuleIdGuard } from './shared/guards/id.guard';
import { DocumentModule } from './document/document.module';
import { MeasureModule } from './measure/measure.module';
import { AppNavbarComponent } from './app-navbar.component';
import { CatalogModule } from './catalog/catalog.module';
import { BreadcrumbTrailComponent } from './breadcrumb-trail.component';
import { CatalogModuleModule } from './catalog-module/catalog-module.module';
import { CatalogRequirementViewComponent } from './views/catalog-requirement-view.component';
import { CatalogRequirementModule } from './catalog-requirement/catalog-requirement.module';
import { ErrorService } from './shared/services/error.service';

const routes = [
  {
    path: 'catalog-modules/:catalogModuleId/catalog-requirements',
    canActivate: [AuthGuard, CatalogModuleIdGuard],
    component: CatalogRequirementViewComponent,
  },
  { path: '**', redirectTo: 'projects' },
];

@NgModule({
  declarations: [
    AppComponent,
    AppToolbarComponent,
    AppNavbarComponent,
    BreadcrumbTrailComponent,
    CatalogRequirementViewComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    MaterialModule,
    SharedModule,
    UserModule,
    JiraProjectModule,
    ProjectModule,
    RequirementModule,
    DocumentModule,
    MeasureModule,
    CatalogModule,
    CatalogModuleModule,
    CatalogRequirementModule,
  ],
  providers: [{ provide: ErrorHandler, useClass: ErrorService }],
  bootstrap: [AppComponent],
})
export class AppModule {}
