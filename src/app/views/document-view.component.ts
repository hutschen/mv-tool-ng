import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-document-view',
  template: `
    <mvtool-document-table></mvtool-document-table>
  `,
  styles: []
})
export class DocumentViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
