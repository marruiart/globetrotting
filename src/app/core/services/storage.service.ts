import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';
import { Auth } from '../models/globetrotting/auth.interface';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  add(token: string): Observable<Auth> {
    return new Observable<Auth>(observer => {
      if (token) {
        Preferences.set({
          key: 'jwtToken',
          value: JSON.stringify(token)
        }).then((_) => {
          observer.next({ jwt: token });
          observer.complete();
        }).catch((error: any) => {
          observer.error(error);
        });
      } else if (token == '') {
        Preferences.remove({ key: 'jwtToken' })
          .catch(err => {
            observer.error(err);
          });
        observer.next({ jwt: '' });
        observer.complete();
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  get(): Observable<Auth> {
    return new Observable<Auth>(observer => {
      Preferences.get({ key: 'jwtToken' })
        .then((token: any) => {
          if (token != null && token['value']) {
            observer.next({ jwt: JSON.parse(token.value) });
          } else {
            observer.next();
          }
          observer.complete();
        }).catch((error: any) => {
          observer.next(error)
        });
    });
  }

}