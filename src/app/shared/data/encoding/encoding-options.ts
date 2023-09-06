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

import { Observable, map, of, tap } from 'rxjs';
import { EncodingService } from '../../services/encoding.service';
import { IOption, OptionValue, Options } from '../options';

export class EncodingOptions extends Options {
  override readonly hasToLoad = true;
  protected _loadedOptions?: IOption[];

  constructor(
    protected _encodingService: EncodingService,
    multiple: boolean = true
  ) {
    super(multiple);
  }

  protected _loadOptions(): Observable<IOption[]> {
    if (this._loadedOptions) return of(this._loadedOptions);
    return this._encodingService.listEncodings().pipe(
      map((encodings) =>
        encodings.map((e) => ({
          value: e.encoding,
          label: e.description ? `${e.name}, ${e.description}` : e.name,
        }))
      ),
      tap((options) => (this._loadedOptions = options))
    );
  }

  override getOptions(...values: OptionValue[]): Observable<IOption[]> {
    const valuesSet = new Set(values);
    return this._loadOptions().pipe(
      map((options) => options.filter((o) => valuesSet.has(o.value)))
    );
  }

  override filterOptions(
    filter?: string | null | undefined,
    limit?: number | undefined
  ): Observable<IOption[]> {
    return this._loadOptions().pipe(
      map((options) =>
        filter
          ? options.filter((o) =>
              o.label.toLowerCase().includes(filter.toLowerCase())
            )
          : options
      ),
      map((options) => (limit ? options.slice(0, limit) : options))
    );
  }
}
