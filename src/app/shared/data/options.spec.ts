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

import { take } from 'rxjs';
import { StaticOptions, StringOptions, IOption } from './options';

describe('StaticOptions', () => {
  const sampleOptions: IOption[] = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
  ];

  it('should create an instance', () => {
    const instance = new StaticOptions(sampleOptions);
    expect(instance).toBeTruthy();
  });

  it('should load initial values', (done) => {
    const instance = new StaticOptions(sampleOptions, true, [1, 3]);
    instance.selected$.pipe(take(1)).subscribe((selectedOptions) => {
      expect(selectedOptions).toEqual([sampleOptions[0], sampleOptions[2]]);
      done();
    });
  });

  it('should indicate that if it is a multiple selection', () => {
    const instance1 = new StaticOptions(sampleOptions, false);
    expect(instance1.isMultipleSelection).toBe(false);

    const instance2 = new StaticOptions(sampleOptions, true);
    expect(instance2.isMultipleSelection).toBe(true);
  });

  it('should get options by values', (done) => {
    const instance = new StaticOptions(sampleOptions);
    instance.getOptions(1, 3).subscribe((options) => {
      expect(options).toEqual([sampleOptions[0], sampleOptions[2]]);
      done();
    });
  });

  it('should filter options', (done) => {
    const instance = new StaticOptions(sampleOptions);
    instance.filterOptions('1').subscribe((filteredOptions) => {
      expect(filteredOptions).toEqual([sampleOptions[0]]);
      done();
    });
  });

  it('should select options', (done) => {
    const instance = new StaticOptions(sampleOptions, true);
    instance.selected$.pipe(take(2)).subscribe((selectedOptions) => {
      if (selectedOptions.length === 0) {
        return;
      }
      expect(selectedOptions).toEqual([sampleOptions[0], sampleOptions[2]]);
      done();
    });
    instance.selectOptions(sampleOptions[0], sampleOptions[2]);
  });

  it('should deselect options', (done) => {
    const instance = new StaticOptions(sampleOptions, true, [1, 3]);
    instance.selected$.pipe(take(2)).subscribe((selectedOptions) => {
      if (selectedOptions.length === 2) {
        return;
      }
      expect(selectedOptions).toEqual([sampleOptions[0]]);
      done();
    });
    instance.deselectOptions(sampleOptions[2]);
  });

  it('should clear the selection', (done) => {
    const instance = new StaticOptions(sampleOptions, true, [1, 3]);
    instance.selected$.pipe(take(2)).subscribe((selectedOptions) => {
      if (selectedOptions.length === 2) {
        return;
      }
      expect(selectedOptions).toEqual([]);
      done();
    });
    instance.clearSelection();
  });
});

describe('StringOptions', () => {
  const sampleStrings = ['apple', 'banana', 'cherry'];

  it('should create an instance', () => {
    const instance = new StringOptions(sampleStrings);
    expect(instance).toBeTruthy();
  });

  it('should convert string values to IOptions', () => {
    const instance = new StringOptions(sampleStrings);
    const expectedResult: IOption[] = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
    ];
    expect(instance.options).toEqual(expectedResult);
  });
});
