import { Component, OnInit } from '@angular/core';
import { EventsService } from '../events.service';
import { NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = "";
  password: string = "";

  login_link = "api/auth/generate_auth_cookie/?insecure=cool";
  loaders = [null];
  constructor(private navController: NavController, 
    private toastController: ToastController, 
    private alertController: AlertController, 
    private eventsService: EventsService,
    private httpClient: HttpClient,
    private storage: Storage,
    private route: ActivatedRoute, 
    private router: Router,
    private linkService: LinkService,
    private loadingController: LoadingController) { }

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
      duration: 2000
    });
    toast.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: "Login Successful",
          message: "You have been logged in successfully.",
          buttons: [{
            text: "OK",
            handler: () => {

              this.eventsService.publishEvent("updateMenu");

              this.route.queryParams.subscribe(params => {
                if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.hasOwnProperty('state')) {
                  console.log(this.router.getCurrentNavigation().extras.state);
                  let next  = this.router.getCurrentNavigation().extras.state.next;
          
                  this.navController.navigateForward(next);
                }else{
                  this.navController.navigateRoot('home');
                }
              },(err)=>{
                console.log(err);
              });         
            }
          }]
    });

    await alert.present();
  }

  login(){
    this.presentLoader(0);
    this.httpClient.get(this.linkService.getAPILink() + this.login_link + '&username=' + this.username + '&password=' + this.password)
    .subscribe((data: any)=>{
      this.dismissLoader(0);
      console.log(data);

      if(data.error){
        this.presentToast(data.error);
        return;
      }

      this.storage.set("userLoginInfo", data).then( (data) => {
        this.presentAlert();
      });
    },
    (err)=>{
      console.log(err)
      this.dismissLoader(0);
    });
  }

  signup(){
    this.navController.navigateForward('signup');
  }
}
