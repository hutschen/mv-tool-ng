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

import { PropertyRead } from '@angular/compiler';
import { combineLatest, of, skip, Subject } from 'rxjs';
import { IQueryParams } from '../services/query-params.service';
import {
  DataColumn,
  DataColumns,
  DataField,
  DataFrame,
  IDataItem,
} from './data';

class DummyDataItem implements IDataItem {
  id = 1;
  field_name: string | null = 'field value';
}

describe('DataField', () => {
  const name = 'field_name';
  const label = 'Field Name';
  const optional = true;
  const item = new DummyDataItem();
  let sut: DataField<DummyDataItem, string | null>;

  beforeEach(() => {
    sut = new DataField(name, label, optional);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
    expect(sut.name).toEqual(name);
    expect(sut.label).toEqual(label);
    expect(sut.optional).toEqual(optional);
    expect(sut.required).toBeFalse();
  });

  it('label should be its name in title case', () => {
    const sut = new DataField('field_name', null, optional);
    expect(sut.label).toEqual(label);
  });

  it('should get value', () => {
    const item = new DummyDataItem();
    expect(sut.toValue(item)).toEqual(item.field_name);
  });

  it('should throw error if value does not exist', () => {
    expect(() => sut.toValue({ id: 1 } as DummyDataItem)).toThrowError();
  });

  it('should convert value to string', () => {
    expect(sut.toStr(item)).toEqual('field value');
    expect(sut.toStr({ id: 1, field_name: null } as DummyDataItem)).toEqual('');
  });

  it('should convert value to boolean', () => {
    expect(sut.toBool(item)).toBeTrue();
    expect(
      sut.toBool({ id: 1, field_name: null } as DummyDataItem)
    ).toBeFalse();
  });

  it('should be required when initialized as non-optional', () => {
    const sut = new DataField(name, label, false);
    expect(sut.optional).toBeFalse();
    expect(sut.required).toBeTrue();
  });

  it('must never be optional when it is required', () => {
    const sut = new DataField(name, label, false);
    sut.optional = true;
    expect(sut.optional).toBeFalse();
    expect(sut.required).toBeTrue();
  });

  it('can be set to non-optional if initialized as optional', () => {
    const sut = new DataField(name, label, true);
    sut.optional = false;
    expect(sut.optional).toBeFalse();
    expect(sut.required).toBeFalse();
  });

  it('should be shown if it is required', (done: DoneFn) => {
    const sut = new DataField(name, label, false);
    expect(sut.required).toBeTrue();
    sut
      .isShown({ id: 1, field_name: null } as DummyDataItem)
      .subscribe((isShown) => {
        expect(isShown).toBeTrue();
        done();
      });
  });

  it('should be shown if it is non-optional', (done: DoneFn) => {
    const sut = new DataField(name, label, true);
    sut.optional = false;
    expect(sut.required).toBeFalse();
    expect(sut.optional).toBeFalse();
    sut
      .isShown({ id: 1, field_name: null } as DummyDataItem)
      .subscribe((isShown) => {
        expect(isShown).toBeTrue();
        done();
      });
  });

  it('should be shown if it is optional and has a value', (done: DoneFn) => {
    const sut = new DataField(name, label, true);
    expect(sut.optional).toBeTrue();
    sut.isShown(item).subscribe((isShown) => {
      expect(isShown).toBeTrue();
      done();
    });
  });

  it('should be hidden if it is optional and has no value', (done: DoneFn) => {
    const sut = new DataField(name, label, true);
    expect(sut.optional).toBeTrue();
    sut
      .isShown({ id: 1, field_name: null } as DummyDataItem)
      .subscribe((isShown) => {
        expect(isShown).toBeFalse();
        done();
      });
  });
});

describe('DataColumn', () => {
  let field: any;
  let filters: any;
  let sut: DataColumn<any>;

  beforeEach(() => {
    field = jasmine.createSpyObj('DataField', ['isShown'], {
      name: 'field_name',
      label: 'Field Name',
      optional$: new Subject<boolean>(),
    });
    filters = {} as any;
  });

  it('should be hidden when it is the only column mentioned in query params', (done: DoneFn) => {
    field.required = false;
    sut = new DataColumn(field, filters, { _hidden_columns: field.name });

    sut.hidden$.subscribe((hidden) => {
      expect(hidden).toBeTrue();
      done();
    });
    expect(sut.hidden).toBeTrue();
  });

  it('should be hidden when it is not the only column mentioned in query params', (done: DoneFn) => {
    field.required = false;
    sut = new DataColumn(field, filters, {
      _hidden_columns: [field.name, 'other_field_name'],
    });

    sut.hidden$.subscribe((hidden) => {
      expect(hidden).toBeTrue();
      done();
    });
    expect(sut.hidden).toBeTrue();
  });

  it('should not initially be hidden', (done: DoneFn) => {
    field.required = false;
    sut = new DataColumn(field, filters, {});

    sut.hidden$.subscribe((hidden) => {
      expect(hidden).toBeFalse();
      done();
    });
    expect(sut.hidden).toBeFalse();
  });

  it('should never be hidden if it is required, even if it is mentioned in query params', (done: DoneFn) => {
    field.required = true;
    sut = new DataColumn(field, filters, { _hidden_columns: 'field_name' });

    sut.hidden$.subscribe((hidden) => {
      expect(hidden).toBeFalse();
      done();
    });
    expect(sut.hidden).toBeFalse();
  });

  it('should never be set to hidden if it is required', (done: DoneFn) => {
    field.required = true;
    sut = new DataColumn(field, filters, {});
    sut.hidden = true;

    sut.hidden$.subscribe((hidden) => {
      expect(hidden).toBeFalse();
      done();
    });
    expect(sut.hidden).toBeFalse();
  });

  it('should be able to be set to hidden if it is not required', (done: DoneFn) => {
    field.required = false;
    sut = new DataColumn(field, filters, {});
    sut.hidden = true;

    sut.hidden$.subscribe((hidden) => {
      expect(hidden).toBeTrue();
      done();
    });
    expect(sut.hidden).toBeTrue();
  });

  it('should never be shown if it is hidden', (done: DoneFn) => {
    const data: any[] = [{}, {}, {}];
    sut = new DataColumn(field, filters, {});
    sut.hidden = true;

    sut.isShown(data).subscribe((isShown) => {
      expect(isShown).toBeFalse();
      done();
    });
    field.optional$.next(true);
    expect(field.isShown).not.toHaveBeenCalled();
  });

  it('should always be shown if it is non-optional', (done: DoneFn) => {
    const data: any[] = [{}, {}, {}];
    sut = new DataColumn(field, filters, {});

    sut.isShown(data).subscribe((isShown) => {
      expect(isShown).toBeTrue();
      done();
    });
    field.optional$.next(false);
    expect(field.isShown).not.toHaveBeenCalled();
  });

  it('should not be shown if it is optional and data array is empty', (done: DoneFn) => {
    const data: any[] = [];
    sut = new DataColumn(field, filters, {});

    sut.isShown(data).subscribe((isShown) => {
      expect(isShown).toBeFalse();
      done();
    });
    field.optional$.next(true);
    expect(field.isShown).not.toHaveBeenCalled();
  });

  it('should be shown if it is optional, data array is not empty and field is shown', (done: DoneFn) => {
    const data: any[] = [{}, {}, {}];
    field.optional = true;
    field.isShown.and.returnValue(of(true));
    sut = new DataColumn(field, filters, {});

    sut.isShown(data).subscribe((isShown) => {
      expect(isShown).toBeTrue();
      done();
    });
    field.optional$.next(true);
    expect(field.isShown).toHaveBeenCalled();
  });
});

describe('DataColumns', () => {
  const createColumnSpy = function (
    name: string,
    required: boolean = false
  ): any {
    return jasmine.createSpyObj(name, ['isShown'], {
      name,
      required,
      hidden$: new Subject<boolean>(),
      filters: jasmine.createSpyObj('Filters of ' + name, ['clear'], {
        queryParams$: new Subject<IQueryParams>(),
        isSet$: new Subject<boolean>(),
      }),
    });
  };
  let sut: DataColumns<any>;

  it('should be created without columns', () => {
    sut = new DataColumns([]);
    expect(sut).toBeTruthy();
  });

  it('should be created with columns', () => {
    const columns = [createColumnSpy('column1'), createColumnSpy('column2')];
    sut = new DataColumns(columns);
    expect(sut).toBeTruthy();
  });

  it('should ensure unique column names', () => {
    const columns = [
      createColumnSpy('column1'),
      createColumnSpy('column2'),
      createColumnSpy('column1'),
    ];
    expect(() => new DataColumns(columns)).toThrowError(/unique/i);
  });

  it('should provide a list of hideable columns', () => {
    const nonRequiredColumns = [
      createColumnSpy('column1', false),
      createColumnSpy('column2', false),
    ];
    const columns = [...nonRequiredColumns, createColumnSpy('column3', true)];
    sut = new DataColumns(columns);
    expect(sut.hideableColumns).toEqual(nonRequiredColumns);
  });

  it('should combine hidden status of columns into query params', (done: DoneFn) => {
    const hiddenColumn = createColumnSpy('column1', false);
    const nonHiddenColumn = createColumnSpy('column2');
    sut = new DataColumns([hiddenColumn, nonHiddenColumn]);

    sut.hiddenQueryParams$.subscribe((queryParams) => {
      expect(queryParams['_hidden_columns']).toEqual([hiddenColumn.name]);
      done();
    });
    hiddenColumn.hidden = true;
    hiddenColumn.hidden$.next(true);
    nonHiddenColumn.hidden = false;
    nonHiddenColumn.hidden$.next(false);
  });

  it('should indicate if columns are hidden', (done: DoneFn) => {
    const hiddenColumn = createColumnSpy('column1');
    const nonHiddenColumn = createColumnSpy('column2');
    sut = new DataColumns([hiddenColumn, nonHiddenColumn]);

    sut.areColumnsHidden$.subscribe((areHidden) => {
      expect(areHidden).toBeTrue();
      done();
    });
    hiddenColumn.hidden$.next(true);
    nonHiddenColumn.hidden$.next(false);
  });

  it('should indicate if filters are set on columns', (done: DoneFn) => {
    const hiddenColumn = createColumnSpy('column1', false);
    const nonHiddenColumn = createColumnSpy('column2');
    sut = new DataColumns([hiddenColumn, nonHiddenColumn]);

    sut.areFiltersSet$.subscribe((areSet) => {
      expect(areSet).toBeTrue();
      done();
    });
    hiddenColumn.filters.isSet$.next(true);
    nonHiddenColumn.filters.isSet$.next(false);
  });

  it('should combine filter values into query params', (done: DoneFn) => {
    const column1 = createColumnSpy('column1');
    const column2 = createColumnSpy('column2');
    sut = new DataColumns([column1, column2]);

    sut.filterQueryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        column1: 'value1',
        column2: 'value2',
      });
      done();
    });
    column1.filters.queryParams$.next({ column1: 'value1' });
    column2.filters.queryParams$.next({ column2: 'value2' });
  });

  it('should get column by name', () => {
    const column1 = createColumnSpy('column1');
    sut = new DataColumns([column1]);

    expect(sut.getColumn('column1')).toBe(column1);
    expect(() => sut.getColumn('column2')).toThrowError(/not found/i);
  });

  it('should get shown columns', (done: DoneFn) => {
    const shownColumn = createColumnSpy('column1', false);
    const hiddenColumn = createColumnSpy('column2', false);
    shownColumn.isShown.and.returnValue(of(true));
    hiddenColumn.isShown.and.returnValue(of(false));
    sut = new DataColumns([shownColumn, hiddenColumn]);

    sut.getShownColumns([]).subscribe((columns) => {
      expect(columns).toEqual([shownColumn]);
      done();
    });
  });

  it('should clear filters of all columns', () => {
    const column1 = createColumnSpy('column1');
    const column2 = createColumnSpy('column2');
    sut = new DataColumns([column1, column2]);

    sut.clearFilters();
    expect(column1.filters.clear).toHaveBeenCalled();
    expect(column2.filters.clear).toHaveBeenCalled();
  });

  it('should unhide all columns', () => {
    const column1 = createColumnSpy('column1');
    const column2 = createColumnSpy('column2');
    column1.hidden = true;
    column2.hidden = false;
    sut = new DataColumns([column1, column2]);

    sut.unhideAllColumns();
    expect(column1.hidden).toBeFalse();
    expect(column2.hidden).toBeFalse();
  });
});

describe('DataFrame', () => {
  let columns: any;
  let search: any;
  let sort: any;
  let paginator: any;
  let sut: DataFrame<any>;

  beforeEach(() => {
    columns = jasmine.createSpyObj('Columns', ['getShownColumns'], {
      filterQueryParams$: new Subject<IQueryParams>(),
      hiddenQueryParams$: new Subject<IQueryParams>(),
      columns: [],
    });
    search = jasmine.createSpyObj('Search', ['filter'], {
      queryParams$: new Subject<IQueryParams>(),
    });
    sort = jasmine.createSpyObj('Sort', ['sort'], {
      queryParams$: new Subject<IQueryParams>(),
    });
    paginator = jasmine.createSpyObj('Paginator', ['toFirstPage'], {
      queryParams$: new Subject<IQueryParams>(),
    });
  });

  it('should be created without anything', () => {
    sut = new DataFrame([]);
    expect(sut).toBeTruthy();
  });

  it('should switch to the first page when filter, search or sort change for the second time', (done: DoneFn) => {
    sut = new DataFrame(columns, {}, search, sort, paginator);

    sut.queryParams$.pipe(skip(1)).subscribe((queryParams) => {
      expect(queryParams).toEqual({ value: 2 });
      expect(paginator.toFirstPage).toHaveBeenCalled();
      done();
    });

    [1, 2].forEach((value) => {
      columns.filterQueryParams$.next({ value });
      columns.hiddenQueryParams$.next({ value });
      search.queryParams$.next({ value });
      sort.queryParams$.next({ value });
      paginator.queryParams$.next({ value });
    });
  });

  it('should combine query params of search, sort, paginator and columns', (done: DoneFn) => {
    const filterQueryParams = { filter: 'value' };
    const hiddenQueryParams = { hidden: 'value' };
    const searchQueryParams = { search: 'value' };
    const sortQueryParams = { sort: 'value' };
    const paginatorQueryParams = { paginator: 'value' };
    sut = new DataFrame(columns, {}, search, sort, paginator, 0);

    sut.queryParams$.subscribe((queryParams) => {
      expect(queryParams).toEqual({
        ...filterQueryParams,
        ...hiddenQueryParams,
        ...searchQueryParams,
        ...sortQueryParams,
        ...paginatorQueryParams,
      });
      done();
    });

    columns.filterQueryParams$.next(filterQueryParams);
    columns.hiddenQueryParams$.next(hiddenQueryParams);
    search.queryParams$.next(searchQueryParams);
    sort.queryParams$.next(sortQueryParams);
    paginator.queryParams$.next(paginatorQueryParams);
  });

  it('should get names of shown columns', (done: DoneFn) => {
    const columnNames = ['column1', 'column2'];
    columns.getShownColumns.and.returnValue(
      of(columnNames.map((name) => jasmine.createSpyObj(name, [], { name })))
    );
    sut = new DataFrame(columns);

    sut.columnNames$.subscribe((columnNames_) => {
      expect(columnNames_).toEqual(columnNames);
      expect(columns.getShownColumns).toHaveBeenCalled();
      done();
    });
  });

  it('should load names of non-optional columns and set them non-optional', (done: DoneFn) => {
    const column1 = {
      name: 'column1',
    };
    columns = jasmine.createSpyObj('Columns', ['getShownColumns'], {
      filterQueryParams$: new Subject<IQueryParams>(),
      hiddenQueryParams$: new Subject<IQueryParams>(),
      columns: [column1],
    });
    sut = new DataFrame(columns, {}, search, sort, paginator, 0);
    expect(sut.isLoading).toBeFalse(); // loading should not be started yet

    // check if getColumnNames is called
    const getColumnNames = spyOn(sut, 'getColumnNames').and.callFake(() => {
      expect(sut.isLoading).toBeTrue(); // loading should be in progress
      return of(['column1']);
    });

    // check if column is set non-optional
    Object.defineProperty(column1, 'optional', {
      get: () => true,
      set: (optional) => {
        expect(getColumnNames).toHaveBeenCalled();
        expect(optional).toBeFalse();
        expect(sut.isLoading).toBeFalse(); // loading should be finished
        done();
        return false;
      },
    });

    // trigger loading column names and data
    sut.reload();
  });

  it('should load data', (done: DoneFn) => {
    sut = new DataFrame(columns, {}, search, sort, paginator, 0);
    expect(sut.isLoading).toBeFalse(); // loading should not be started yet

    // check if getData is called
    const getData = spyOn(sut, 'getData').and.callFake((queryParams) => {
      expect(sut.isLoading).toBeTrue(); // loading should be in progress
      expect(queryParams).toEqual({});
      return of([]);
    });

    // check if data is passed to _dataSubject
    spyOn(sut['_dataSubject'], 'next').and.callFake(() => {
      expect(getData).toHaveBeenCalled();
      expect(sut.isLoading).toBeFalse(); // loading should be finished
      done();
    });

    // trigger loading column names and data
    search.queryParams$.next({});
    sort.queryParams$.next({});
    columns.filterQueryParams$.next({});
    paginator.queryParams$.next({});
    sut.reload();
  });

  it('initial length should be 0', (done: DoneFn) => {
    sut = new DataFrame(columns);
    sut.length$.subscribe((length) => {
      expect(length).toBe(0);
      done();
    });
  });

  xit('should get length of data', () => {
    // TODO: implement test
  });

  it('should add item', (done: DoneFn) => {
    // TODO: test also the case when an item is not added because the page is full
    sut = new DataFrame([]);
    const item = { id: 1 };

    sut.data$
      .pipe(
        skip(1) // skip initial data
      )
      .subscribe((data) => {
        expect(data).toEqual([item]);
        expect(sut.length).toBe(1);
        done();
      });

    expect(sut.addItem(item)).toBeTrue();
  });

  it('should update item', (done: DoneFn) => {
    // TODO: test also the case when an item is not updated because it is not found
    sut = new DataFrame([]);
    const initialItem = { id: 1, value: 'initial' };
    const updatedItem = { id: 1, value: 'updated' };

    sut.data$
      .pipe(
        skip(2) // skip initial data, skip adding initial item
      )
      .subscribe((data) => {
        expect(data).toEqual([updatedItem]);
        expect(sut.length).toBe(1);
        done();
      });

    expect(sut.addItem(initialItem)).toBeTrue();
    expect(sut.updateItem(updatedItem)).toBeTrue();
  });

  it('should remove item', () => {
    // TODO: test also the case when an item is not removed because it is not found
    sut = new DataFrame([]);
    const item = { id: 1 };

    sut.data$
      .pipe(
        skip(2) // skip initial data, skip adding initial item
      )
      .subscribe((data) => {
        expect(data).toEqual([]);
        expect(sut.length).toBe(0);
      });

    expect(sut.addItem(item)).toBeTrue();
    expect(sut.removeItem(item)).toBeTrue();
  });
});
