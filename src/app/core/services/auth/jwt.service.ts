import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { JwtAuth } from '../../models/globetrotting/auth.interface';
import { StorageService } from '../storage.service';
import { AuthFacade } from '../../+state/auth/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  private _jwt: string = "";

  constructor(
    private storageSvc: StorageService,
    private authFacade: AuthFacade
  ) { }

  /**
 * Saves the JWT token.
 * @param jwt The JWT token to be saved.
 * @returns An observable of the saved JWT authentication object.
 */
  public saveToken(jwt: string): Observable<JwtAuth> {
    return this.storageSvc.add(jwt).pipe(tap({
      next: res => {
        if (res) {
          this._jwt = res.jwt;
        }
      },
      error: err => {
        console.error(err);
      }
    }));
  }

  /**
 * Loads the JWT token from storage.
 * @returns An observable of the loaded JWT authentication object.
 */
  public loadToken(): Observable<JwtAuth> {
    return this.storageSvc.get().pipe(tap({
      next: token => {
        if (token) {
          this._jwt = token.jwt;
          this.authFacade.setLoginStateTrue();
        }
      },
      error: err => {
        console.error(err);
      }
    }));
  }

  /**
 * Retrieves the current JWT token.
 * @returns The current JWT token as a string.
 */
  public getToken(): string {
    return this._jwt;
  }

  /**
 * Destroys the current JWT token by setting it to an empty string and saving the change in storage.
 * @returns An observable of the updated JWT authentication object.
 */
  public destroyToken() {
    this._jwt = "";
    return this.storageSvc.add(this._jwt);
  }

}
