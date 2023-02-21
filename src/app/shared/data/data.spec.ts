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

import { DataField, IDataItem } from './data';

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
