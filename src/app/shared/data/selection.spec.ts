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

import { take } from 'rxjs/operators';
import { IDataItem } from './data';
import { DataSelection } from './selection';

describe('DataSelection', () => {
  interface MockDataItem extends IDataItem {
    id: number;
    name: string;
  }

  interface MockDataItemWithStringId extends IDataItem {
    id: string;
    name: string;
  }

  const dataItem1: MockDataItem = { id: 1, name: 'item1' };
  const dataItem2: MockDataItem = { id: 2, name: 'item2' };

  it('should initialize with the provided name, multiple setting and initial query params', (done) => {
    const dataSelection = new DataSelection<MockDataItem>('test', true, {
      test: [dataItem1.id],
    });

    expect(dataSelection.name).toBe('test');
    expect(dataSelection.selected).toEqual([dataItem1.id]);
    dataSelection.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({ test: [dataItem1.id] });
      done();
    });
  });

  it('should not convert ids in initial query params to integers when idType is set to "string"', (done) => {
    const dataSelection = new DataSelection<MockDataItemWithStringId>(
      'test',
      true,
      { test: ['1', '2'] },
      'string'
    );

    expect(dataSelection.selected).toEqual(['1', '2']);
    dataSelection.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({ test: ['1', '2'] });
      done();
    });
  });

  it('should reject initial query params if they cannot be converted to integers when idType is set to "number"', (done) => {
    const dataSelection = new DataSelection<MockDataItem>(
      'test',
      true,
      { test: ['a', '1'] },
      'number'
    );

    expect(dataSelection.selected).toEqual([]);
    dataSelection.queryParams$.pipe(take(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({});
      done();
    });
  });

  it('should emit query params when selection changes', (done) => {
    const dataSelection = new DataSelection<MockDataItem>('test');

    let count = 0;
    dataSelection.queryParams$.pipe(take(2)).subscribe((queryParams) => {
      count++;
      if (dataSelection.selected.length === 0) {
        expect(queryParams).toEqual({});
      } else {
        expect(queryParams).toEqual({ test: [dataItem1.id] });
        expect(count).toBe(2);
        done();
      }
    });

    dataSelection.select(dataItem1);
  });

  it('should select and deselect items', () => {
    const dataSelection = new DataSelection<MockDataItem>('test', true);

    dataSelection.select(dataItem1);
    expect(dataSelection.selected).toEqual([dataItem1.id]);

    dataSelection.deselect(dataItem1);
    expect(dataSelection.selected).toEqual([]);
  });

  it('should toggle items', () => {
    const dataSelection = new DataSelection<MockDataItem>('test', true);

    dataSelection.toggle(dataItem1);
    expect(dataSelection.selected).toEqual([dataItem1.id]);

    dataSelection.toggle(dataItem1);
    expect(dataSelection.selected).toEqual([]);
  });

  it('should clear the selection', () => {
    const dataSelection = new DataSelection<MockDataItem>('test', true);

    dataSelection.select(dataItem1, dataItem2);
    expect(dataSelection.selected).toEqual([dataItem1.id, dataItem2.id]);

    dataSelection.clear();
    expect(dataSelection.selected).toEqual([]);
  });

  it('should check if an item is selected', () => {
    const dataSelection = new DataSelection<MockDataItem>('test', true);

    dataSelection.select(dataItem1);
    expect(dataSelection.isSelected(dataItem1)).toBe(true);
    expect(dataSelection.isSelected(dataItem2)).toBe(false);
  });
});
