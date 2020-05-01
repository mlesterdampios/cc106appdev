import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Storage } from '@ionic/storage';
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  isLoggedIn : boolean = false;
  constructor(private router: Router,
    private storage: Storage,
    private eventsService: EventsService) { 
      this.storage.ready().then(() => {
        this.storage.get("userLoginInfo").then((userLoginInfo) => {
          if (userLoginInfo != null) {
            this.isLoggedIn = true;
          }else{
            this.isLoggedIn = false;
          }
        })
      });

      this.eventsService.getObservable().subscribe((data) => {
        if(data=="updateMenu"){
          this.storage.ready().then(() => {
            this.storage.get("userLoginInfo").then((userLoginInfo) => {
              if (userLoginInfo != null) {
                this.isLoggedIn = true;
              }else{
                this.isLoggedIn = false;
              }
            })
          });
  
        }
      });
  }

  canActivate(): boolean{
    if(!this.isLoggedIn){
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

}
