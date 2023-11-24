import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  private _subs: { [component: string]: Subscription[] } = {}

  constructor() { }

  public unsubscribe(component: string) {
    if (component in this._subs) {
      this._subs[component].forEach(s => s.unsubscribe());
      delete this._subs[component];
    }
  }

  public addSubscription(component: string, sub: Subscription) {
    if (component in this._subs) {
      this._subs[component].push(sub);
    } else {
      this._subs[component] = [sub];
    }
  }
}
