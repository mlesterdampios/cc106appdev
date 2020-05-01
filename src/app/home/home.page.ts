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
  loader;
  loader2;
  constructor(private navController: NavController,
    private toastController: ToastController,
    private httpClient: HttpClient,
    private linkService: LinkService,
    private loadingController: LoadingController) { 
      this.page = 2;

      this.loadMoreProducts(null);
      this.presentLoader();
      this.httpClient.get(this.linkService.getAPILink() + this.products_link + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
        this.dismissLoader();
        this.products = data;
        console.log(this.products);
      },
      (err)=>{
        this.dismissLoader();
        console.log(err);
      });
    }

  ngOnInit() {
  }
  async presentLoader2() {
    this.loader2 = await this.loadingController.create({
      message: 'Please wait...'
    });
    await this.loader2.present();
  }

  async dismissLoader2() {
    if(this.loader2==null) return;
      await this.loader2.dismiss()
      .then(()=>{
        this.loader2 = null;
      })
      .catch(e => console.log(e));
  }

  async presentLoader() {
    this.loader = await this.loadingController.create({
      message: 'Please wait...'
    });
    await this.loader.present();
  }

  async dismissLoader() {
    if(this.loader==null) return;
      await this.loader.dismiss()
      .then(()=>{
        this.loader = null;
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

    this.presentLoader2();
    this.httpClient.get(this.linkService.getAPILink() + this.products_link + '?page='+ this.page+'&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
      this.dismissLoader2();
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
      this.dismissLoader2();
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
