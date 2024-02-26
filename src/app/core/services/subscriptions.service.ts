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
          console.info("unsubscribe: ", s);
          s.unsubscribe();
          s = null;
        }
      });
      delete this._subs[component];
    }
  }

  public addSubscriptions(subs: Sub[]) {
    subs.forEach(s => {
      if (s.component in this._subs) {
        this._subs[s.component].push(s.sub);
      } else {
        this._subs[s.component] = [s.sub];
      }
    })
  }

  public addSubscription(sub: Sub) {
    this.addSubscriptions([sub]);
  }
}
