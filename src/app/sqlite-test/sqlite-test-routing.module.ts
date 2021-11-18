import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SqliteTestPage } from './sqlite-test.page';

const routes: Routes = [
  {
    path: '',
    component: SqliteTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SqliteTestPageRoutingModule {}
