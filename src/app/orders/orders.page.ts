import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  id: number;
  orders: any[] = [];
  page: number = 2;
  loaders = [null, null];
  
  orders_link = "wp-json/wc/v2/orders?customer=";

  constructor(private httpClient: HttpClient,
    private toastController: ToastController,
    private storage: Storage,
    private loadingController: LoadingController,
    private linkService: LinkService
    ) {
    this.storage.get("userLoginInfo").then((userLoginInfo) => {
      this.id = userLoginInfo.user.id;

      this.presentLoader(0);
      this.httpClient.get(this.linkService.getAPILink() + this.orders_link+ this.id + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
        this.dismissLoader(0);
        this.orders  = data;
          console.log(this.orders);
      },
      (err)=>{
        this.dismissLoader(0);
        console.log(err);
      });
    })
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

  async presentToast(pMessage) {
    const toast = await this.toastController.create({
      message: pMessage,
      duration: 5000
    });
    toast.present();
  }

  loadMoreOrders(event){
    this.presentLoader(1);
    this.httpClient.get(this.linkService.getAPILink() + this.orders_link+ this.id + "&page=" + this.page + '&consumer_key='+ this.linkService.getConsumerKey() + '&consumer_secret='+this.linkService.getConsumerSecret()).subscribe((data: any)=>{
      this.dismissLoader(1);
      this.orders  = this.orders.concat(data);
      console.log(this.orders);

      if(data.length < 10 && event != null){
        event.target.disabled = true;
        this.presentToast("No more orders!");

      }
      event.target.complete();
      this.page ++;
    },
    (err)=>{
      this.dismissLoader(1);
      console.log(err);
    });

  }

}
