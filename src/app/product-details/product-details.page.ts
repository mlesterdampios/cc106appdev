import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {

  product: any;
  reviews: any[] = [];
  selectedOptions: any = {};
  requireOptions: boolean = true;
  productVariations: any[] = [];
  productPrice: number = 0.0;
  selectedVariation: any;
  loading: any;
  loader2;
  products_link = "wp-json/wc/v2/products";

  constructor(private navController: NavController, 
    private storage: Storage, 
    private toastController: ToastController,
    private loadingController: LoadingController,
    private route: ActivatedRoute, 
    private router: Router,
    private httpClient: HttpClient,
    private linkService: LinkService) {

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.hasOwnProperty('state')) {
          this.product = this.router.getCurrentNavigation().extras.state.product;

          console.log(this.product);
          if(this.product.attributes.length == 0){
            this.requireOptions = false;
            this.productPrice = this.product.price;
          }
          this.presentLoader2();
          this.httpClient.get(this.linkService.getAPILink() + this.products_link + '/' + this.product.id + '/reviews' + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
            this.dismissLoader2();
            this.reviews = data;
            console.log(this.reviews);
          },
          (err)=>{
            this.dismissLoader2();
            console.log(err);
          });
        }
      },(err)=>{
        console.log(err);
      });
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
  ngOnInit() {
  }

  async presentToast(pMessage) {
    const toast = await this.toastController.create({
      message: pMessage,
      duration: 3000
    });
    toast.present();
  }

  addToCart(product) {

    //counting selected attribute options
    let count = 0;
    for (let k in this.selectedOptions) if (this.selectedOptions.hasOwnProperty(k)) count++;

    //counting variation attributes options
    let count_ = 0;
    for (var index = 0; index < this.product.attributes.length; index++) {
      
      if(this.product.attributes[index].variation)
        count_++;
      
    }

    //checking if user selected all the variation options or not

    if(count_ != count || this.requireOptions)
    {
      this.presentToast("Select Product Options");
      return; 
    }



    this.storage.get("cart").then((data) => {

      if (data == undefined || data.length == 0) {
        data = [];

        data.push({
          "product": product,
          "qty": 1,
          "amount": parseFloat(product.price)
        });

        if(this.selectedVariation){
          data[0].variation = this.selectedVariation;
          data[0].amount = parseFloat(this.selectedVariation.price);
        }

      } else {

        let alreadyAdded = false;
        let alreadyAddedIndex = -1;

        for (let i = 0; i < data.length; i++){
          if(data[i].product.id == product.id){ //Product ID matched
            if(this.productVariations.length > 0){ //Now match variation ID also if it exists
              if(data[i].variation.id == this.selectedVariation.id){
                alreadyAdded = true;
                alreadyAddedIndex = i;
                break;
              }
            } else { //product is simple product so variation does not  matter
              alreadyAdded = true;
              alreadyAddedIndex = i;
              break;
            }
          }
        }

        if(alreadyAdded == true){
          if(this.selectedVariation){
            data[alreadyAddedIndex].qty = parseFloat(data[alreadyAddedIndex].qty) + 1;
            data[alreadyAddedIndex].amount = parseFloat(data[alreadyAddedIndex].amount) + parseFloat(this.selectedVariation.price);
            data[alreadyAddedIndex].variation = this.selectedVariation;
          } else {
            data[alreadyAddedIndex].qty = parseFloat(data[alreadyAddedIndex].qty) + 1;
            data[alreadyAddedIndex].amount = parseFloat(data[alreadyAddedIndex].amount) + parseFloat(data[alreadyAddedIndex].product.price);
          } 
        } else {
          if(this.selectedVariation){
            data.push({
              product: product,
              qty: 1,
              amount: parseFloat(this.selectedVariation.price),
              variation: this.selectedVariation
            })
          } else {
            data.push({
              product: product,
              qty: 1,
              amount: parseFloat(product.price)
            })
          }
        }

      }


      this.storage.set("cart", data).then(() => {
        console.log("Cart Updated");
        console.log(data);

        this.presentToast("Cart Updated");
      })

    })

  }

  openCart(){

    //this.modalController.create(Cart).present();

  }

  async presentLoader(options: any = {}) {
    this.loading = await this.loadingController.create(options);
    await this.loading.present();
  }

  async dismissLoader() {
    await this.loading.dismiss()
    .then(()=>{
      this.loading = null;
    })
    .catch(e => console.log(e));
  }

  async check(justSelectedAttribute) {

    let loading = this.loadingController.create({
      message: "Getting Product Variations"
    });

    //counting selected attribute options
    let count = 0;
    for (let k in this.selectedOptions) 
      if (this.selectedOptions.hasOwnProperty(k)) 
        count++;

    let count_ = 0;
    for (var index = 0; index < this.product.attributes.length; index++) {
      
      if(this.product.attributes[index].variation)
        count_++;
      
    }

    //checking if user selected all the variation options or not

    if(count_ != count){
      this.requireOptions = true;
      return;
    } else {
      this.requireOptions = false;

      //Get product variations only once when all product variables are selected by the user
      this.presentLoader({
        message: "Getting Product Variations"
      });
      //this.productVariations = JSON.parse((await this.WooCommerce.getAsync('products/' + this.product.id + '/variations/')).body);
      this.productVariations = await this.httpClient.get(this.linkService.getAPILink() + this.products_link + '/' + this.product.id + '/variations' + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).toPromise<any>();
      this.dismissLoader();
      console.log("await httpClient line...");
      console.log(this.productVariations)
    }

    let i = 0, matchFailed = false;

    if (this.productVariations.length > 0) {
      for (i = 0; i < this.productVariations.length; i++) {
        matchFailed = false;
        let key: string = "";

        for (let j = 0; j < this.productVariations[i].attributes.length; j++) {
          key = this.productVariations[i].attributes[j].name;

          console.log(this.selectedOptions[key].toLowerCase()+ " " + this.productVariations[i].attributes[j].option.toLowerCase())

          if (this.selectedOptions[key].toLowerCase() == this.productVariations[i].attributes[j].option.toLowerCase()) {
            //Do nothing
          } else {
            console.log(matchFailed)
            matchFailed = true;
            break;
          }
        }

        if (matchFailed) {
          continue;
        } else {
          //found the matching variation
          //console.log(productVariations[i])
          this.productPrice = this.productVariations[i].price;
          this.selectedVariation = this.productVariations[i];
          console.log(this.selectedVariation)

          break;

        }

      }

      if(matchFailed == true){
        this.presentToast("No Such Product Found").then(()=>{
          this.requireOptions = true;
        });
      }
    } else {
      this.productPrice = this.product.price;

    }
  }

}
