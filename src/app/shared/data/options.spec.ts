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

import { forkJoin, take } from 'rxjs';
import {
  StaticOptions,
  StringOptions,
  IOption,
  OptionValue,
  fromOptionValues,
  toOptionValues,
} from './options';

describe('toOptionValues', () => {
  it('should return an array of option values when input is an array of strings or numbers', () => {
    const input1: unknown = ['a', 'b', 'c'];
    const input2: unknown = [1, 2, 3];

    const result1 = toOptionValues(input1);
    const result2 = toOptionValues(input2);

    expect(result1).toEqual(['a', 'b', 'c']);
    expect(result2).toEqual([1, 2, 3]);
  });

  it('should return a single element array when input is a single string or number', () => {
    const input1: unknown = 'a';
    const input2: unknown = 1;

    const result1 = toOptionValues(input1);
    const result2 = toOptionValues(input2);

    expect(result1).toEqual(['a']);
    expect(result2).toEqual([1]);
  });

  it('should return an empty array for invalid input', () => {
    const input1: unknown = { key: 'value' };
    const input2: unknown = undefined;
    const input3: unknown = null;

    const result1 = toOptionValues(input1);
    const result2 = toOptionValues(input2);
    const result3 = toOptionValues(input3);

    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
    expect(result3).toEqual([]);
  });
});

describe('fromOptionValues', () => {
  it('should return the same array when multiple is true', () => {
    const values: OptionValue[] = ['a', 'b', 'c'];
    const result = fromOptionValues(values, true);

    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should return the first element when multiple is false and the array is not empty', () => {
    const values: OptionValue[] = ['a', 'b', 'c'];
    const result = fromOptionValues(values, false);

    expect(result).toEqual('a');
  });

  it('should return null when multiple is false and the array is empty', () => {
    const values: OptionValue[] = [];
    const result = fromOptionValues(values, false);

    expect(result).toBeNull();
  });
});

describe('StaticOptions', () => {
  const sampleOptions: IOption[] = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
  ];

  it('should create an instance', (done) => {
    const instance = new StaticOptions(sampleOptions);
    expect(instance).toBeTruthy();

    // Check if the selection is empty
    instance.selection$.subscribe((options) => {
      expect(options).toEqual([]);
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

  it('should get no options by values when no values are given', (done) => {
    const instance = new StaticOptions(sampleOptions);
    instance.getOptions().subscribe((options) => {
      expect(options).toEqual([]);
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

    forkJoin([
      instance.selectionChanged$.pipe(take(1)), // select
      instance.selection$.pipe(take(2)), // initial selection, select
    ]).subscribe(([selectionChanged, selection]) => {
      expect(selectionChanged).toEqual([sampleOptions[0], sampleOptions[2]]);
      expect(selection).toEqual([sampleOptions[0], sampleOptions[2]]);
      done();
    });

    instance.selectOptions(sampleOptions[0], sampleOptions[2]);
  });

  it('should deselect options', (done) => {
    const instance = new StaticOptions(sampleOptions, true);

    forkJoin([
      instance.selectionChanged$.pipe(take(2)), // select and deselect
      instance.selection$.pipe(take(3)), // initial selection, select, deselect
    ]).subscribe(([selectionChanged, selection]) => {
      expect(selectionChanged).toEqual([sampleOptions[0]]);
      expect(selection).toEqual([sampleOptions[0]]);
      done();
    });

    instance.selectOptions(sampleOptions[0], sampleOptions[2]);
    instance.deselectOptions(sampleOptions[2]);
  });

  it('should set the selection', (done) => {
    const instance = new StaticOptions(sampleOptions, true);

    forkJoin([
      instance.selectionChanged$.pipe(take(1)), // set selection
      instance.selection$.pipe(take(2)), // initial selection, set selection
    ]).subscribe(([selectionChanged, selection]) => {
      expect(selectionChanged).toEqual([sampleOptions[1]]);
      expect(selection).toEqual([sampleOptions[1]]);
      done();
    });

    instance.setSelection(sampleOptions[1]);
  });

  it('should clear the selection', (done) => {
    const instance = new StaticOptions(sampleOptions, true);

    forkJoin([
      instance.selectionChanged$.pipe(take(2)), // select, clear selection
      instance.selection$.pipe(take(3)), // initial selection, select, clear selection
    ]).subscribe(([selectionChanged, selection]) => {
      expect(selectionChanged).toEqual([]);
      expect(selection).toEqual([]);
      done();
    });

    instance.selectOptions(sampleOptions[0], sampleOptions[2]);
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
