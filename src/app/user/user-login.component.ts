import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'mvtool-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  protected _auth: AuthService;
  @Output() loggedIn: EventEmitter<void>;
  hidePassword: boolean = true;
  keepLoggedIn: boolean = false;
  credentials = {
    username: '',
    password: ''
  }
  
  constructor(auth: AuthService) {
    this._auth = auth;
    this.loggedIn = this._auth.loggedIn;
  }

  onReset() {
    this.keepLoggedIn = false;
    this.credentials = {
      username: '',
      password: ''
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this._auth.logIn(this.credentials, this.keepLoggedIn);
    }
  }

  ngOnInit(): void {
  }

}
