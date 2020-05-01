import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductsByCategoryPageRoutingModule } from './products-by-category-routing.module';

import { ProductsByCategoryPage } from './products-by-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductsByCategoryPageRoutingModule
  ],
  declarations: [ProductsByCategoryPage]
})
export class ProductsByCategoryPageModule {}
