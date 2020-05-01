import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  apiLink: string = "https://cc106.syncshop.online/";
  consumer_key: string  = "ck_xxx";
  consumer_secret: string  = "cs_xxx";
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
