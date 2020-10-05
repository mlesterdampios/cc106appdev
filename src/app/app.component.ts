import { Component, OnInit } from '@angular/core';

import { Platform, NavController, ModalController, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';
import { EventsService } from './events.service';

import { HttpClient } from '@angular/common/http';

import { NavigationExtras } from '@angular/router';

import { CartPage } from './cart/cart.page';

import { LinkService } from './link.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  categories: any[];

  loggedIn: boolean;
  user: any;
  loaders = [null];

  products_categories_link = "wp-json/wc/v3/products/categories";

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navController: NavController,
    private storage: Storage,
    private eventsService: EventsService,
    private httpClient: HttpClient,
    private modalController: ModalController,
    private linkService: LinkService,
    private loadingController: LoadingController,
    private oneSignal: OneSignal
  ) {
    this.initializeApp();

    this.categories = [];
    this.user = {};
    this.presentLoader(0);
    this.httpClient.get(this.linkService.getAPILink() + this.products_categories_link + '?consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
      this.dismissLoader(0);
      console.log(data);

      let temp = data;

      for (let i = 0; i < temp.length; i++) {
        if (temp[i].parent == 0) {

          temp[i].subCategories = [];

          if (temp[i].slug == "clothing") {
            temp[i].icon = "shirt";
          }
          if (temp[i].slug == "music") {
            temp[i].icon = "musical-notes";
          }
          if (temp[i].slug == "posters") {
            temp[i].icon = "images";
          }

          this.categories.push(temp[i]);
        } 
      }

      //Groups Subcategories

      for (let i = 0; i < temp.length; i++){
        for (let j = 0; j < this.categories.length; j++){
          //console.log("Checking " + j + " " + i)
          if(this.categories[j].id == temp[i].parent){
            this.categories[j].subCategories.push(temp[i]);
          }
        }
      }
    },
    (err)=>{
      this.dismissLoader(0);
      console.log(err);
    });

    this.eventsService.getObservable().subscribe((data) => {
      if(data=="updateMenu"){
        this.storage.ready().then(() => {
          this.storage.get("userLoginInfo").then((userLoginInfo) => {

            if (userLoginInfo != null) {

              console.log("User logged in...");
              this.user = userLoginInfo.user;
              console.log(this.user);
              this.loggedIn = true;
            }
            else {
              console.log("No user found.");
              this.user = {};
              this.loggedIn = false;
            }

          })
        });

      }
    });
  }

  setupPush() {
    // I recommend to put these into your environment.ts
    this.oneSignal.startInit('52d9e899-61c8-43bf-b41f-be5076a87e56', '950002655380');
 
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
 
    // Notifcation was received in general
    this.oneSignal.handleNotificationReceived().subscribe(data => {
    });
 
    // Notification was really clicked/opened
    this.oneSignal.handleNotificationOpened().subscribe(data => {
    });
 
    this.oneSignal.endInit();
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

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (this.platform.is('cordova')) {
        this.setupPush();
      }
    });
  }

  ngOnInit() {
    this.storage.ready().then(() => {
      this.storage.get("userLoginInfo").then((userLoginInfo) => {

        if (userLoginInfo != null) {

          console.log("User logged in...");
          this.user = userLoginInfo.user;
          console.log(this.user);
          this.loggedIn = true;
        }
        else {
          console.log("No user found.");
          this.user = {};
          this.loggedIn = false;
        }

      })
    });
  }

  openCategoryPage(category) {
    let navigationExtras: NavigationExtras = {
      state: {
        category
      }
    };
    this.navController.navigateForward('products-by-category', navigationExtras);

  }

  openPage(pageName: string) {
    if (pageName == "signup") {
      this.navController.navigateForward('signup');
    }
    if (pageName == "login") {
      this.navController.navigateForward('login');
    }
    if (pageName == "orders") {
      this.navController.navigateForward('orders');
    }
    if (pageName == "groupmembers") {
      this.navController.navigateForward('groupmembers');
    }
    if (pageName == 'logout') {
      this.storage.remove("userLoginInfo").then(() => {
        this.user = {};
        this.loggedIn = false;
      })
    }
    if (pageName == 'cart') {
      this.presentModal();
    }

  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CartPage
    });
    return await modal.present();
  }
}
