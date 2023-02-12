// Copyright (C) 2023 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Observable, OperatorFunction, Subscription } from 'rxjs';

/**
 * The exhausLatestMap operator ensures that only one active operation (project)
 * is performed at a time, while the latest emission is processed when an
 * operation completes. All emissions that occur in the meantime are discarded.
 *
 * innerSubscription is overwritten each time a new emission from the original
 * observable occurs. When an emission occurs and no innerSubscription is
 * active, a new innerSubscription is created with the result of the project
 * call.
 *
 * During an active innerSubscription all further emissions from the original
 * observable are discarded and only the last emission is saved (lastValue).
 *
 * When the innerSubscription is completed, the last saved emission (lastValue)
 * is processed by creating a new innerSubscription.
 */
export function exhaustLatestMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {
  let innerSubscription: undefined | Subscription;
  let lastValue: T;

  return function (source: Observable<T>) {
    return new Observable<R>((observer) => {
      return source.subscribe({
        next: (value) => {
          lastValue = value;
          if (!innerSubscription) {
            innerSubscription = project(value, 0).subscribe({
              next: (result) => {
                observer.next(result);
              },
              error: (error) => {
                observer.error(error);
              },
              complete: () => {
                innerSubscription = undefined;
                if (lastValue) {
                  innerSubscription = project(lastValue, 0).subscribe({
                    next: (result) => {
                      observer.next(result);
                    },
                    error: (error) => {
                      observer.error(error);
                    },
                    complete: () => {
                      innerSubscription = undefined;
                    },
                  });
                }
              },
            });
          }
        },
        error: (error) => {
          observer.error(error);
        },
        complete: () => {
          observer.complete();
        },
      });
    });
  };
}
