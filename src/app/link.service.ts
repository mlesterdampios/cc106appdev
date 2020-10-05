import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  apiLink: string = "https://cc106.rxmsolutions.com/";
  consumer_key: string  = "ck_9317a7ab7b5faf18664be6de904434b988c2209b";
  consumer_secret: string  = "cs_55f0248def4c1bce9cda1f68df7fef01bc4a6f3d";
  constructor() { }

  getAPILink() : string{
    return this.apiLink;
  }

  getConsumerKey(): string{
    return this.consumer_key;
  }

  getConsumerSecret(): string{
    return this.consumer_secret;
  }
}
