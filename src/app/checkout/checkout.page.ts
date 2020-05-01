import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';

import { LinkService } from '../link.service';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  newOrder: any;
  paymentMethods: any[];
  paymentMethod: any;
  billing_shipping_same: boolean;
  userInfo: any;

  customers_link = "wp-json/wc/v3/customers";
  orders_link = "wp-json/wc/v3/orders";

  email;
  loader;
  loader2;
  loader3;

  constructor(private payPal: PayPal, 
    private navController: NavController,
    private storage: Storage, 
    private alertController: AlertController, 
    private httpClient: HttpClient,
    private linkService: LinkService,
    private loadingController: LoadingController) { 
      this.newOrder = {};
      this.newOrder.billing = {};
      this.newOrder.shipping = {};
      this.billing_shipping_same = false;

      this.paymentMethods = [
        { method_id: "bacs", method_title: "Direct Bank Transfer" },
        { method_id: "cheque", method_title: "Cheque Payment" },
        { method_id: "cod", method_title: "Cash on Delivery" },
        { method_id: "paypal", method_title: "PayPal" }];

      this.storage.get("userLoginInfo").then((userLoginInfo) => {
        this.userInfo = userLoginInfo.user;
        this.email = userLoginInfo.user.email;
        let id = userLoginInfo.user.id;

        this.presentLoader();
        this.httpClient.get(this.linkService.getAPILink() + this.customers_link +'/' + id + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
          this.dismissLoader();
          this.newOrder = data;
          console.log(this.newOrder);
        },
        (err)=>{
          this.dismissLoader();
          console.log(err);
        });
      })
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

  async presentLoader3() {
    this.loader3 = await this.loadingController.create({
      message: 'Please wait...'
    });
    await this.loader3.present();
  }

  async dismissLoader3() {
    if(this.loader3==null) return;
      await this.loader3.dismiss()
      .then(()=>{
        this.loader3 = null;
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
  
  setBillingToShipping() {
    this.billing_shipping_same = !this.billing_shipping_same;
    if (this.billing_shipping_same) {
      this.newOrder.shipping = this.newOrder.billing;
    }
  }

  ngOnInit() {
  }

  placeOrder() {

    let orderItems: any[] = [];
    let data: any = {};

    let paymentData: any = {};

    this.paymentMethods.forEach((element, index) => {
      if (element.method_id == this.paymentMethod) {
        paymentData = element;
      }
    });


    data = {

      //Fixed a bug here. Updated in accordance with wc/v2 API
      payment_method: paymentData.method_id,
      payment_method_title: paymentData.method_title,
      set_paid: true,
      status: "processing",

      billing: this.newOrder.billing,
      shipping: this.newOrder.shipping,
      customer_id: this.userInfo.id || '',
      line_items: orderItems
    };

    data.billing.email = this.email;
    data.shipping.email = this.email;

    data.billing.postcode = data.billing.postcode.toString() || '';
    data.shipping.postcode = data.shipping.postcode.toString() || '';


    if (paymentData.method_id == "paypal") {
      
      this.payPal.init({
        PayPalEnvironmentProduction: "YOUR_PRODUCTION_CLIENT_ID",
        PayPalEnvironmentSandbox: "Ae8LguTbSvJCX2FAaph10eul1o14X9BmuEyeKGwxM7_pHndr42sCi1RTO2mn-29jMaVL4vrYNqqy5S2q"
      }).then(() => {
        // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
        this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
          // Only needed if you get an "Internal Service Error" after PayPal login!
          //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
        })).then(() => {

          this.storage.get("cart").then((cart) => {

            let total = 0.00;
            cart.forEach((element, index) => {

              if(element.variation){
                orderItems.push({ product_id: element.product.id, variation_id: element.variation.id, quantity: element.qty });
                total = total + (element.variation.price * element.qty);
              } else {
                orderItems.push({ product_id: element.product.id, quantity: element.qty });
                total = total + (element.product.price * element.qty);
              }
            });

            let payment = new PayPalPayment(total.toString(), 'USD', 'Description', 'sale');
            this.payPal.renderSinglePaymentUI(payment).then((response) => {
              // Successfully paid

              alert(JSON.stringify(response));


              data.line_items = orderItems;
              //console.log(data);
              let orderData: any = {};

              orderData.order = data;
              this.presentLoader2();
              this.httpClient.post(this.linkService.getAPILink() + this.orders_link + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret(), orderData.order).subscribe((data: any)=>{
                this.dismissLoader2(); 
                console.log(data);
                let response = data;
          
                this.presentAlert("Order Placed Successfully", "Your order has been placed successfully. Order#" + response.id);
              },
              (err)=>{ 
                this.dismissLoader2(); 
                console.log(err);
              });
            })

          }, () => {
            // Error or render dialog closed without being successful
          });
        }, () => {
          // Error in configuration
        });
      }, () => {
        // Error in initialization, maybe PayPal isn't supported or something else
      });
      
    } else {

      this.storage.get("cart").then((cart) => {

        cart.forEach((element, index) => {
          if(element.variation){
            orderItems.push({ product_id: element.product.id, variation_id: element.variation.id, quantity: element.qty });
            ///total = total + (element.variation.price * element.qty);
          } else {
            orderItems.push({ product_id: element.product.id, quantity: element.qty });
            ///total = total + (element.product.price * element.qty);
          }
        });

        data.line_items = orderItems;

        let orderData: any = {};

        orderData.order = data;
        console.log(orderData.order);
        this.presentLoader3();
        this.httpClient.post(this.linkService.getAPILink() + this.orders_link + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret(), orderData.order).subscribe((data: any)=>{
          this.dismissLoader3(); 
          console.log(data);
          let response = data;
    
          this.presentAlert("Order Placed Successfully", "Your order has been placed successfully. Order#" + response.id);
        },
        (err)=>{ 
          this.dismissLoader3(); 
          console.log(err);
        });
      })
    }
  }

  async presentAlert(pHeader ,pMessage) {
    const alert = await this.alertController.create({
      header: pHeader,
          message: pMessage,
          buttons: [{
            text: "OK",
            handler: () => {
              this.navController.navigateRoot("home");
            }
          }]
    });

    await alert.present();
  }

}
