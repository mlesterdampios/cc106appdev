import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private eventName = new Subject<any>();

  constructor() { }

  publishEvent(data: any){
    this.eventName.next(data);
  }

  getObservable(): Subject<any>{
    return this.eventName;
  }
}