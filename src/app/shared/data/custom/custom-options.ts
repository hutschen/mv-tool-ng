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

import { StaticOptions, StringOptions } from '../options';

export class ComplianceStatusOptions extends StaticOptions {
  constructor(multiple: boolean = true) {
    super(
      [
        { value: 'C', label: 'Compliant (C)' },
        { value: 'PC', label: 'Partially Compliant (PC)' },
        { value: 'NC', label: 'Not Compliant (NC)' },
        { value: 'N/A', label: 'Not Applicable (N/A)' },
      ],
      multiple
    );
  }
}

export class CompletionStatusOptions extends StringOptions {
  constructor(multiple: boolean = true) {
    super(['open', 'in progress', 'completed'], multiple);
  }
}

export class VerificationMethodOptions extends StaticOptions {
  constructor(multiple: boolean = true) {
    super(
      [
        { value: 'I', label: 'Inspection (I)' },
        { value: 'T', label: 'Test (T)' },
        { value: 'R', label: 'Review (R)' },
      ],
      multiple
    );
  }
}
