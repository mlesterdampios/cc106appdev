import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductsByCategoryPage } from './products-by-category.page';

const routes: Routes = [
  {
    path: '',
    component: ProductsByCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsByCategoryPageRoutingModule {}
