import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mvtool-app-toolbar',
  template: `
    <mat-toolbar color="primary">
      <span>MV-Tool</span>
      <span class="spacer"></span>
      <mvtool-user-menu (loggedOut)="onLogIn()" (logIn)="onLogIn()"></mvtool-user-menu>
    </mat-toolbar>
  `,
  styles: [
    '.spacer { flex: 1 1 auto; }'
  ]
})
export class AppToolbarComponent implements OnInit {

  constructor(protected _router: Router) {}

  onLogIn() {
    this._router.navigate(['/login']);
  }

  ngOnInit(): void {
  }

}
