import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

interface Sub {
  component: string, sub: Subscription
}

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

  public addSubscriptions(subs: Sub[]) {
    subs.forEach(s => {
      if (s.component in this._subs) {
        this._subs[s.component].push(s.sub);
      } else {
        this._subs[s.component] = [s.sub];
      }
    })
  }
}
