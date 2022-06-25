import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  username: string = ''

  constructor() { }

  async logout(): Promise<void> {}

  ngOnInit(): void {
    this.username = 'Firstname Lastname'
  }
}
