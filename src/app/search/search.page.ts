import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  searchQuery: string = "";
  products: any[] = [];
  page: number = 2;
  loader;
  loader2;

  search_link = "wp-json/wc/v2/products?search=";

  constructor(private navController: NavController, 
    private toastController: ToastController,
    private route: ActivatedRoute, 
    private router: Router,
    private httpClient: HttpClient,
    private linkService: LinkService,
    private loadingController: LoadingController) {       
      this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.hasOwnProperty('state')) {
        this.searchQuery  = this.router.getCurrentNavigation().extras.state.searchQuery;
        this.presentLoader();
        this.httpClient.get(this.linkService.getAPILink() + this.search_link+ this.searchQuery + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
          this.dismissLoader();
          this.products  = data;
          console.log(this.products);
        },
        (err)=>{
          this.dismissLoader();
          console.log(err);
        });
      }
    },(err)=>{
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
    this.presentLoader2();
    this.httpClient.get(this.linkService.getAPILink() + this.search_link+ this.searchQuery + "&page=" + this.page + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
      this.dismissLoader2();
      this.products  = this.products.concat(data);
      console.log(this.products);

      if(data.length < 10 && event != null){
        event.target.disabled = true;
        this.presentToast("No more products!");

      }
      event.target.complete();
      this.page ++;
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

}