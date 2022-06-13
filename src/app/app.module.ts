import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { TruncatePipe } from './shared/pipes';

@NgModule({
  declarations: [
    AppComponent,
    ProjectTableComponent,
    TruncatePipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
