import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  newUser: any = {};
  billing_shipping_same: boolean;
  WooCommerce: any;
  loaders = [null, null];

  signup_link = "wp-json/wc/v3/customers";

  constructor(private navController: NavController,
    private toastController: ToastController,
    private alertController: AlertController,
    private httpClient: HttpClient,
    private linkService: LinkService,
    private loadingController: LoadingController) {
      this.newUser.billing_address = {};
      this.newUser.shipping_address = {};
      this.billing_shipping_same = false; 
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

  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same;
  }

  async presentToast(pMessage) {
    const toast = await this.toastController.create({
      message: pMessage,
      duration: 3000
    });
    toast.present();
  }

  async presentAlert(pHeader ,pMessage) {
    const alert = await this.alertController.create({
      header: pHeader,
          message: pMessage,
          buttons: [{
            text: "OK",
            handler: () => {
              this.navController.navigateForward("login");
            }
          }]
    });

    await alert.present();
  }

  checkEmail(){

    let validEmail = false;

    let reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(reg.test(this.newUser.email)){
      //email looks valid
      this.presentLoader(0);
      this.httpClient.get(this.linkService.getAPILink() + this.signup_link + '/?email=' + this.newUser.email + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
        this.dismissLoader(0);
        console.log(data);
        if(data.length==0){
          validEmail = true;
          this.presentToast("Congratulations. Email is good to go.");
        }else{
          validEmail = false;
          this.presentToast("Email already registered. Please check.");
        }

        console.log(validEmail);
      },
      (err)=>{
        this.dismissLoader(0);
        console.log(err);
      });
    } else {
      validEmail = false;
      this.presentToast("Invalid Email. Please check.");
      console.log(validEmail);
    }

  }

  signup(){

    if(this.billing_shipping_same){
      this.newUser.shipping_address = this.newUser.billing_address;
    }

    let customerData = {
      "email": this.newUser.email,
      "first_name": this.newUser.first_name,
      "last_name": this.newUser.last_name,
      "username": this.newUser.username,
      "password": this.newUser.password,
      "billing_address": {
        "first_name": this.newUser.first_name,
        "last_name": this.newUser.last_name,
        "company": "",
        "address_1": this.newUser.billing_address.address_1,
        "address_2": this.newUser.billing_address.address_2,
        "city": this.newUser.billing_address.city,
        "state": this.newUser.billing_address.state,
        "postcode": this.newUser.billing_address.postcode,
        "country": this.newUser.billing_address.country,
        "email": this.newUser.email,
        "phone": this.newUser.billing_address.phone
      },
      "shipping_address": {
        "first_name": this.newUser.first_name,
        "last_name": this.newUser.last_name,
        "company": "",
        "address_1": this.newUser.shipping_address.address_1,
        "address_2": this.newUser.shipping_address.address_2,
        "city": this.newUser.shipping_address.city,
        "state": this.newUser.shipping_address.state,
        "postcode": this.newUser.shipping_address.postcode,
        "country": this.newUser.shipping_address.country
      }
    }

    console.log(customerData);
    this.presentLoader(1);
    this.httpClient.post(this.linkService.getAPILink() + this.signup_link + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret(), customerData).subscribe((data: any)=>{
      this.dismissLoader(1);
      console.log(data);
      let response = data;

      if(response.role=="customer"){
        this.presentAlert("Account Created", "Your account has been created successfully! Please login to proceed.");
      }
    },
    (err)=>{
      this.dismissLoader(1);
      console.log(err);
      if(err.error.message){
        this.presentToast(err.error.message);
      }
    });
  }

}
