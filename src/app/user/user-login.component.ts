import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  hidePassword: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
