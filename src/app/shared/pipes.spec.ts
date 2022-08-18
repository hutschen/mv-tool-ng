// Copyright (C) 2022 Helmar Hutschenreuter
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

import { TruncatePipe } from './pipes';

describe('pipes', () => {
  describe('TruncatePipe', () => {
    let sut: TruncatePipe;

    beforeEach(() => {
      sut = new TruncatePipe();
    });

    it('should shorten long string', () => {
      const limit = 5;
      const result = sut.transform('Hello, world!', limit);
      expect(result?.length).toEqual(limit + '...'.length);
    });
    it('should leave short string alone', () => {
      const str = 'Hello, world!';
      expect(sut.transform(str, str.length)?.length).toEqual(str.length);
    });
    it('should handle null', () => {
      expect(sut.transform(null)).toEqual(null);
    });
  });
});
