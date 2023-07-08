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

export type DefaultValues<T> = {
  [P in keyof T]: T[P];
};

export abstract class PatchEditFlags<T extends Partial<T>> {
  abstract patch: T;
  abstract defaultValues: DefaultValues<T>;

  toggleEdit(...flags: (keyof T)[]): void {
    const isEdited = this.isEdited(...flags);

    flags.forEach((f) => {
      if (isEdited) {
        // Delete value to mark property as unedited
        delete this.patch[f];
      } else {
        // Set default value to mark property as edited
        this.patch[f] = this.defaultValues[f];
      }
    });
  }

  isEdited(...flags: (keyof T)[]): boolean {
    // If any flag is set, the fields are recognized as edited
    return flags.some((f) => this.patch[f] !== undefined);
  }

  // Check if any property in `defaultValues` is set in `patch`.
  get isPatchEdited(): boolean {
    return Object.keys(this.defaultValues).some(
      (k) => this.patch[k as keyof T] !== undefined
    );
  }

  // Aliases to be able to use methods in templates where ... is not available.
  toogleEditMultiple = (flags: (keyof T)[]) => this.toggleEdit(...flags);
  isEditedMultiple = (flags: (keyof T)[]) => this.isEdited(...flags);
}
