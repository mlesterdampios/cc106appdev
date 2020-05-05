import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-products-by-category',
  templateUrl: './products-by-category.page.html',
  styleUrls: ['./products-by-category.page.scss'],
})
export class ProductsByCategoryPage implements OnInit {

  searchQuery: string = "";
  products: any[] = [];
  page: number = 2;
  loaders = [null, null];
  
  search_link = "wp-json/wc/v2/products?category=";

    constructor(private navController: NavController, 
    private toastController: ToastController,
    private route: ActivatedRoute, 
    private router: Router,
    private httpClient: HttpClient,
    private linkService: LinkService,
    private loadingController: LoadingController) {       
      this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.hasOwnProperty('state')) {
        console.log(this.router.getCurrentNavigation().extras.state.category);
        this.searchQuery  = this.router.getCurrentNavigation().extras.state.category.id;
        this.presentLoader(0);
        this.httpClient.get(this.linkService.getAPILink() + this.search_link+ this.searchQuery + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
          this.dismissLoader(0);
          this.products  = data;
          console.log(this.products);
        },
        (err)=>{
          this.dismissLoader(0);
          console.log(err);
        });
      }
    },(err)=>{
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
    this.presentLoader(1);
    this.httpClient.get(this.linkService.getAPILink() + this.search_link+ this.searchQuery + "&page=" + this.page + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
      this.dismissLoader(1);
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

}
