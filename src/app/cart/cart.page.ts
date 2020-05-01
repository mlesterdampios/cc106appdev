import { Component } from '@angular/core';
import { NavController, ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage {


  cartItems: any[] = [];
  total: any;
  showEmptyCartMessage: boolean = false;

  constructor(private navController: NavController, 
    private storage: Storage, 
    private modalController: ModalController, 
    private toastController: ToastController) { 
      this.total = 0.0;
    
      this.storage.ready().then(()=>{

        this.storage.get("cart").then( (data)=>{
          this.cartItems = data;
          console.log(this.cartItems);

          if(this.cartItems.length > 0){

            this.cartItems.forEach( (item, index)=> {

              if(item.variation){
                this.total = this.total + (parseFloat(item.variation.price) * item.qty);
              } else {
                this.total = this.total + (item.product.price * item.qty)
              }

            })

          } else {

            this.showEmptyCartMessage = true;

          }


        })

      })
  }

  removeFromCart(item, i){
    let price;
    
    if(item.variation){
      price = item.variation.price
    } else {
      price = item.product.price;
    }
    let qty = item.qty;
    this.cartItems.splice(i, 1);
    this.storage.set("cart", this.cartItems).then( ()=> {
      this.total = this.total - (price * qty);
    });

    if(this.cartItems.length == 0){
      this.showEmptyCartMessage = true;
    }
  }

  closeModal(){
    this.modalController.dismiss();
  }

  checkout(){
    this.storage.get("userLoginInfo").then( (data) => {
      if(data != null){
        this.modalController.dismiss().then(()=>{
          this.navController.navigateForward('checkout');
        });
      } else {
        let navigationExtras: NavigationExtras = {
          state: {
            next: 'checkout'
          }
        };
        this.navController.navigateForward('Login', navigationExtras)
      }
    })

  }

  changeQty(item, i, change){
    let price;
    if(!item.variation)
      price = item.product.price;
    else
      price = parseFloat(item.variation.price);
    
    let  qty = item.qty;
    if(change < 0 && item.qty == 1){
      return;
    }
    qty = qty + change;
    item.qty = qty;
    item.amount = qty * price;
    this.cartItems[i] = item;
    this.storage.set("cart", this.cartItems).then( ()=> {
      this.presentToast("Cart Updated.");
    });
    this.total = (parseFloat(this.total.toString()) + (parseFloat(price.toString()) * change));
  }

  async presentToast(pMessage) {
    const toast = await this.toastController.create({
      message: pMessage,
      duration: 2000
    });
    toast.present();
  }

}
