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
import { LoginViewComponent } from './views/login-view.component';
import { ProjectsViewComponent } from './views/projects-view.component';
import { AuthGuard } from './auth.guard';
import { GlobalErrorHandler } from './global-error-handler';
import { JiraProjectModule } from './jira-project/jira-project.module';
import { RequirementViewComponent } from './views/requirement-view.component';
import { DocumentViewComponent } from './views/document-view.component';
import { MeasureViewComponent } from './views/measure-view.component';
import { RequirementModule } from './requirement/requirement.module';
import { SharedModule } from './shared/shared.module';
import {
  CatalogIdGuard,
  ProjectIdGuard,
  RequirementIdGuard,
} from './shared/id.guard';
import { DocumentModule } from './document/document.module';
import { MeasureModule } from './measure/measure.module';
import { CatalogViewComponent } from './views/catalog-view.component';
import { AppNavbarComponent } from './app-navbar.component';
import { CatalogModule } from './catalog/catalog.module';
import { BreadcrumbTrailComponent } from './breadcrumb-trail.component';
import { CatalogModuleViewComponent } from './views/catalog-module-view.component';
import { CatalogModuleModule } from './catalog-module/catalog-module.module';
import { CatalogRequirementViewComponent } from './views/catalog-requirement-view.component';

const routes = [
  {
    path: 'catalogs',
    canActivate: [AuthGuard],
    component: CatalogViewComponent,
  },
  {
    path: 'catalogs/:catalogId/catalog-modules',
    canActivate: [AuthGuard, CatalogIdGuard],
    component: CatalogModuleViewComponent,
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    component: ProjectsViewComponent,
  },
  {
    path: 'projects/:projectId/requirements',
    canActivate: [AuthGuard, ProjectIdGuard],
    component: RequirementViewComponent,
  },
  {
    path: 'projects/:projectId/documents',
    canActivate: [AuthGuard, ProjectIdGuard],
    component: DocumentViewComponent,
  },
  {
    path: 'requirements/:requirementId/measures',
    canActivate: [AuthGuard, RequirementIdGuard],
    component: MeasureViewComponent,
  },
  { path: 'login', component: LoginViewComponent },
  { path: '**', redirectTo: 'projects' },
];

@NgModule({
  declarations: [
    AppComponent,
    AppToolbarComponent,
    LoginViewComponent,
    ProjectsViewComponent,
    RequirementViewComponent,
    DocumentViewComponent,
    MeasureViewComponent,
    CatalogViewComponent,
    AppNavbarComponent,
    BreadcrumbTrailComponent,
    CatalogModuleViewComponent,
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
  ],
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
  bootstrap: [AppComponent],
})
export class AppModule {}
