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

  /**
 * Unsubscribes all subscriptions associated with a specified component.
 *
 * This method iterates through all subscriptions stored for the given component and unsubscribes
 * each one. After unsubscribing, it deletes the component's entry from the subscriptions object.
 *
 * @param component The name of the component whose subscriptions need to be unsubscribed.
 */
  public unsubscribe(component: string) {
    if (component in this._subs) {
      this._subs[component].forEach(s => {
        if (s) {
          //console.info("Unsubscribing... ", s);
          s.unsubscribe();
          s = null;
        }
      });
      delete this._subs[component];
    }
  }


  /**
 * Includes a new subscription under the specified component.
 *
 * This method adds a given subscription to the list of subscriptions for the specified component.
 * If the component does not have an existing list of subscriptions, it initializes one.
 *
 * @param sub The subscription object containing the component name and the subscription to include.
 */
  private includeSubscription(sub: Sub) {
    if (sub.component in this._subs) {
      this._subs[sub.component].push(sub.sub);
    } else {
      this._subs[sub.component] = [sub.sub];
    }
  }


  /**
 * Adds multiple subscriptions to a specified component.
 *
 * This method accepts multiple subscriptions and associates each of them with the specified component.
 * It utilizes the `includeSubscription` method to manage the storage of these subscriptions.
 *
 * @param component The name of the component to which the subscriptions should be added.
 * @param subscriptions The subscriptions to add for the specified component.
 */
  public addSubscriptions(component: string, ...subscriptions: Subscription[]) {
    subscriptions.forEach(subscription => {
      const sub: Sub = { component: component, sub: subscription };
      this.includeSubscription(sub);
    })
  }
}
