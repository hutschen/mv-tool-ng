import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { ProjectModule } from './project/project.module';
import { MaterialModule } from './material/material.module';

const routes = [
  { 
    path: 'projects', 
    loadChildren: () => import('./project/project.module').then(
      m => m.ProjectModule) 
  },
  { path: '**', redirectTo: 'projects' },
]

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ProjectModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
