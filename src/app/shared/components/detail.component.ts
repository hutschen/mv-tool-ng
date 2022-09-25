import { Component, Input } from '@angular/core';

@Component({
  selector: 'mvtool-detail',
  template: `
    <div fxLayout="row wrap">
      <strong
        [fxFlex.gt-lg]="gtLgFlex"
        [fxFlex.gt-md]="gtMdFlex"
        [fxFlex.gt-sm]="gtSmFlex"
        [fxFlex.gt-xs]="gtXsFlex"
        fxFlex.xs="100"
        >{{ label }}</strong
      >
      <div fxFlex>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [],
})
export class DetailComponent {
  @Input() label: string = '';
  @Input() gtLgFlex: number = 10;

  constructor() {}

  get gtMdFlex(): number {
    return Math.round(this.gtLgFlex * 1.5);
  }

  get gtSmFlex(): number {
    return Math.round(this.gtMdFlex * 1.5);
  }

  get gtXsFlex(): number {
    return Math.round(this.gtSmFlex * 1.5);
  }
}
