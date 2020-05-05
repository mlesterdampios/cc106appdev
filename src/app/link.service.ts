import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  apiLink: string = "https://cc106.syncshop.online/";
  consumer_key: string  = "ck_33b119c8a8fad0361062e227bad14291972c5c5b";
  consumer_secret: string  = "cs_540f38435d134b672c0d5807497977d33503e5f5";
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
