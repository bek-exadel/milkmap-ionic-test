import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SqliteTestPageRoutingModule } from './sqlite-test-routing.module';

import { SqliteTestPage } from './sqlite-test.page';
import { SQLiteService } from '../services/sqlite.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SqliteTestPageRoutingModule
  ],
  declarations: [SqliteTestPage],
  providers: [SQLiteService]
})
export class SqliteTestPageModule {}
