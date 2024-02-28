import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

interface Sub {
  component: string, sub: Subscription | null
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  private _subs: { [component: string]: (Subscription | null)[] } = {}

  constructor() { }

  public unsubscribe(component: string) {
    if (component in this._subs) {
      this._subs[component].forEach(s => {
        if (s) {
          console.info("Unsubscribing... ", s);
          s.unsubscribe();
          s = null;
        }
      });
      delete this._subs[component];
    }
  }

  private includeSubscription(sub: Sub) {
    if (sub.component in this._subs) {
      this._subs[sub.component].push(sub.sub);
    } else {
      this._subs[sub.component] = [sub.sub];
    }
  }

  public addSubscriptions(component: string, ...subscriptions: Subscription[]) {
    subscriptions.forEach(subscription => {
      const sub: Sub = { component: component, sub: subscription };
      this.includeSubscription(sub);
    })
  }
}
