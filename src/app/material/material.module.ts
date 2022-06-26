import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule} from '@angular/material/card';
import { MatDividerModule} from '@angular/material/divider';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule} from '@angular/material/input';
import { MatMenuModule} from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule} from '@angular/material/toolbar';

@NgModule({
  declarations: [],
  imports: [],
  exports: [
    FormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    MatToolbarModule,
  ]
})
export class MaterialModule { }
