import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupmembersPage } from './groupmembers.page';

const routes: Routes = [
  {
    path: '',
    component: GroupmembersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupmembersPageRoutingModule {}
