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

import { PatchEditFlags } from './patch-edit-flags';

interface Dummy {
  prop1?: string;
  prop2?: string | null;
}

/**
 * `DummyPatchEditFlags` is a test-specific implementation of `PatchEditFlags`
 * for the `Dummy` interface. It allows testing the logic in the abstract class
 * by providing concrete `patch` and `defaultValues`.
 */
class DummyPatchEditFlags extends PatchEditFlags<Dummy> {
  patch = {};
  defaultValues = {
    prop1: '',
    prop2: null,
  };
}

describe('PatchEditFlags', () => {
  let patchFlags: DummyPatchEditFlags;

  beforeEach(() => {
    patchFlags = new DummyPatchEditFlags();
  });

  it('should mark flags as edited on toggleEdit if they were not edited', () => {
    patchFlags.toggleEdit('prop1', 'prop2');

    expect(patchFlags.patch).toEqual({
      prop1: '',
      prop2: null,
    });
  });

  it('should mark flags as unedited on toggleEdit if they were edited', () => {
    patchFlags.patch = {
      prop1: '',
      prop2: null,
    };

    patchFlags.toggleEdit('prop1', 'prop2');

    expect(patchFlags.patch).toEqual({});
  });

  it('should return true on isEdited if any flag is edited', () => {
    patchFlags.patch = {
      prop1: '',
    };

    expect(patchFlags.isEdited('prop1', 'prop2')).toBe(true);
  });

  it('should return false on isEdited if none of the flags is edited', () => {
    expect(patchFlags.isEdited('prop1', 'prop2')).toBe(false);
  });

  it('should return true on isPatchEdited if one of the default properties is set in patch', () => {
    patchFlags.patch = {
      prop1: '',
    };

    expect(patchFlags.isPatchEdited).toBe(true);
  });

  it('should return false on isPatchEdited if none of the default properties is set in patch', () => {
    patchFlags.patch = {};

    expect(patchFlags.isPatchEdited).toBe(false);
  });

  // Test for aliases
  it('should call toggleEdit with correct arguments on toogleEditMultiple', () => {
    const spy = spyOn(patchFlags, 'toggleEdit');
    patchFlags.toogleEditMultiple(['prop1', 'prop2']);
    expect(spy).toHaveBeenCalledWith('prop1', 'prop2');
  });

  it('should call isEdited with correct arguments on isEditedMultiple', () => {
    const spy = spyOn(patchFlags, 'isEdited');
    patchFlags.isEditedMultiple(['prop1', 'prop2']);
    expect(spy).toHaveBeenCalledWith('prop1', 'prop2');
  });
});
