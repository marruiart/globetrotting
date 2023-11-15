import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';
import { Auth } from '../models/auth.interface';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  add(token: string): Observable<string> {
    return new Observable<string>(observer => {
      Preferences.set({
        key: 'jwtToken',
        value: JSON.stringify(token)
      }).then((_) => {
        observer.next(token);
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    });
  }

  get(): Observable<Auth> {
    return new Observable<Auth>(observer => {
      Preferences.get({ key: 'jwtToken' })
        .then((token: any) => {
          if (token != null && token['value']) {
            observer.next({jwt: JSON.parse(token.value)});
          }
          observer.complete();
        }).catch((error: any) => {
          observer.next(error)
        });
    });
  }

}