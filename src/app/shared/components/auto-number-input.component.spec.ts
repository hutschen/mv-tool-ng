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

import { IAutoNumber, isAutoNumber } from './auto-number-input.component';

describe('isAutoNumber', () => {
  const validObj: IAutoNumber = {
    kind: 'number',
    start: 1,
    step: 2,
    prefix: 'test',
    suffix: null,
  };

  it('should return true for a valid IAutoNumber object', () => {
    expect(isAutoNumber(validObj)).toBeTrue();
  });

  it('should return false if kind is not "number"', () => {
    expect(isAutoNumber({ ...validObj, kind: 'string' })).toBeFalse();
  });

  it('should return false if start or step is not an integer greater than 0', () => {
    expect(isAutoNumber({ ...validObj, start: -1 })).toBeFalse();
    expect(isAutoNumber({ ...validObj, start: 1.5 })).toBeFalse();
  });

  it('should return false if prefix or suffix is not of type string or null', () => {
    expect(isAutoNumber({ ...validObj, prefix: 123 })).toBeFalse();
  });

  it('should return false if any of the required fields is missing', () => {
    const { start, ...objWithoutStart } = validObj;
    expect(isAutoNumber(objWithoutStart)).toBeFalse();
  });
});
