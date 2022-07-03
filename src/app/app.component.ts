import { Component } from '@angular/core';

@Component({
  selector: 'mvtool-root',
  template: `
    <mvtool-app-toolbar>
      <mvtool-app-breadcrumb-trail></mvtool-app-breadcrumb-trail>
    </mvtool-app-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {}
