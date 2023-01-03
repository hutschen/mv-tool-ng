import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'mvtool-detail',
  template: `
    <div class="fx-row-wrap">
      <strong [style]="flexStyle">{{ label }}</strong>
      <div class="fx-flex">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['../styles/flex.scss'],
  styles: [],
})
export class DetailComponent implements OnDestroy {
  @Input() label: string = '';
  @Input() gtLgFlex: number = 10;
  protected _destroy$ = new Subject<void>();
  protected _sizesMap = new Map([
    [Breakpoints.XSmall, 100],
    [Breakpoints.Small, Math.round(this.gtLgFlex * 1.5 ** 3)],
    [Breakpoints.Medium, Math.round(this.gtLgFlex * 1.5 ** 2)],
    [Breakpoints.Large, Math.round(this.gtLgFlex * 1.5)],
    [Breakpoints.XLarge, this.gtLgFlex],
  ]);
  currentSize: number = this.gtLgFlex;

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this._destroy$))
      .subscribe((bpState: BreakpointState) => {
        let currentSize = this.gtLgFlex;
        for (const query of Object.keys(bpState.breakpoints)) {
          if (bpState.breakpoints[query]) {
            currentSize = this._sizesMap.get(query) ?? currentSize;
          }
        }
        this.currentSize = currentSize;
      });
  }

  get flexStyle(): any {
    return {
      flex: `1 1 ${this.currentSize}%`,
      'box-sizing': 'border-box',
      'max-width': `${this.currentSize}%`,
    };
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
