import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mvtool-login-view',
  template: `
    <div class='container' fxLayout='row' fxLayoutAlign='center center'>
      <mat-card>
        <mvtool-user-login (loggedIn)="onLoggedIn()"></mvtool-user-login>
      </mat-card>
    </div>
  `,
  styles: [
    '.container { padding: 20px;}'
  ]
})
export class LoginViewComponent implements OnInit {

  constructor(protected _router: Router) { }

  onLoggedIn(): void {
    this._router.navigate(['/']);
  }

  ngOnInit(): void {
  }

}
