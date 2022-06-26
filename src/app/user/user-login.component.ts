import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'mvtool-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  hidePassword: boolean = true;
  keepLoggedIn: boolean = false;
  credentials = {
    username: '',
    password: ''
  }
  
  constructor() { }

  onReset() {
    this.keepLoggedIn = false;
    this.credentials = {
      username: '',
      password: ''
    }
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
      console.log(this.credentials);
    }
  }

  ngOnInit(): void {
  }

}
