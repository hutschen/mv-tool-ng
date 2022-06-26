import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-login-view',
  template: `
    <div class='container' fxLayout='row' fxLayoutAlign='center center'>
      <mat-card>
        <mvtool-user-login></mvtool-user-login>
      </mat-card>
    </div>
  `,
  styles: [
    '.container { padding: 20px;}'
  ]
})
export class LoginViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
