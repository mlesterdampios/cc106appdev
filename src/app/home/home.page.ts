import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras } from '@angular/router';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  products: any[];
  moreProducts: any[];
  page: number;
  searchQuery: string = "";

  products_link = "wp-json/wc/v3/products";
  loaders = [null, null];
  constructor(private navController: NavController,
    private toastController: ToastController,
    private httpClient: HttpClient,
    private linkService: LinkService,
    private loadingController: LoadingController) { 
      this.page = 2;

      this.loadMoreProducts(null);
      this.presentLoader(0);
      this.httpClient.get(this.linkService.getAPILink() + this.products_link + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
        this.dismissLoader(0);
        this.products = data;
        console.log(this.products);
      },
      (err)=>{
        this.dismissLoader(0);
        console.log(err);
      });
    }

  ngOnInit() {
  }

  async presentLoader(num) {
    this.loaders[num] = await this.loadingController.create({
      message: 'Please wait...'
    });
    await this.loaders[num].present();
  }

  async dismissLoader(num) {
    if(this.loaders[num]==null) return;
      await this.loaders[num].dismiss()
      .then(()=>{
        this.loaders[num] = null;
      })
      .catch(e => console.log(e));
  }

  loadMoreProducts(event){
    console.log(event);
    if(event == null)
    {
      this.page = 2;
      this.moreProducts = [];
    }
    else
      this.page++;

    this.presentLoader(1);
    this.httpClient.get(this.linkService.getAPILink() + this.products_link + '?page='+ this.page+'&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
      this.dismissLoader(1);
      this.moreProducts = this.moreProducts.concat(data);
      console.log(this.moreProducts);
      console.log(event);
      if(event != null)
      {
        event.target.complete();
      }

      if(data.length < 10 && event != null){
        event.target.disabled = true;
        this.presentToast("No more products!");
      }
    },
    (err)=>{
      this.dismissLoader(1);
      console.log(err);
    });
  }

  async presentToast(pMessage) {
    const toast = await this.toastController.create({
      message: pMessage,
      duration: 5000
    });
    toast.present();
  }

  openProductPage(product){
    let navigationExtras: NavigationExtras = {
      state: {
        product: product
      }
    };
    this.navController.navigateForward('product-details', navigationExtras);
  }

  onSearch(event){
    if(this.searchQuery.length > 0){
      let navigationExtras: NavigationExtras = {
        state: {
          searchQuery: this.searchQuery
        }
      };
      this.navController.navigateForward('search', navigationExtras);
    }
  }

}
