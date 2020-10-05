import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  apiLink: string = "https://cc106.rxmsolutions.com/";
  consumer_key: string  = "ck_xxxx";
  consumer_secret: string  = "cs_xxxx";
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
