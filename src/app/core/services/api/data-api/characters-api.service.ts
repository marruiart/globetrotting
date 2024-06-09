import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Character } from '../../../models/rick-morty-api/character.interface';
import { HttpService } from '../../http/http.service';
import { Page } from 'src/app/core/models/rick-morty-api/pagination.interface';
import { ExtUser, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { AuthService } from '../../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class CharactersApiService {

  constructor(
    private http: HttpService,
    private authSvc: AuthService,
  ) { }

  /**
   * Retrieves all pages of characters from the API recursively.
   *
   * This function makes an HTTP GET request to the specified URL, retrieving
   * a page of characters. If more pages are available, it recursively requests
   * the next page until all pages are retrieved. The retrieved pages are added
   * to the local database once all pages are fetched.
   *
   * @param {Page<Character>[]} allPages - An array to store all pages of characters.
   * @param {string} [url=`${environment.apiUrl}/character`] - The URL to fetch the characters from.
   * @returns {Observable<Page<Character>[]>} - An observable containing the array of all character pages.
   */
  public getAllFromApi(allPages: Page<Character>[] = [], url: string = `${environment.apiUrl}/character`): Observable<Page<Character>[]> {
    return this.http.get<Page<Character>>(url).pipe(map(res => {
      if (res.info.next) {
        this.getAllFromApi(allPages, res.info.next).subscribe();
      }
      allPages.push(res);
      if (allPages.length == res.info.pages) {
        this.addCharactersToLocalDb(allPages);
      }
      return allPages;
    }));
  }

  private addCharactersToLocalDb(allPages: Page<Character>[]) {
    let sources: Character[] = [];
    for (let page of allPages) {
      for (let character of page.results) {
        sources.push(character);
      }
    }
    this.addAsUserToDb(sources);
  }

  private addAsUserToDb(sources: Character[]) {
    if (sources && sources.length > 0) {
      let loc: Character | undefined = sources.pop();
      if (loc) {
        this.addCharacter(loc).subscribe({
          next: _ => {
            this.addAsUserToDb(sources);
          },
          error: _ => {
            if (loc != undefined) {
              this.addAsUserToDb(sources);
            }
          }
        });
      }
    }
  }

  private getCharacterCredentials(character: Character): UserRegisterInfo {
    throw new Error('Method not implemented');
    let _username = character.name.replace(/\s/g, '').toLowerCase();
    /* return {
       username: `${_username}`,
       email: `${_username}@gmail.com`,
       password: "123456"
     }*/
  }

  /**
 * Registers a new character by sending their credentials to the authentication service.
 *
 * This function takes a character object, extracts the necessary credentials, and
 * then registers the character using the authentication service.
 *
 * @param {Character} character - The character to be registered.
 * @returns {Observable<ExtUser>} - An observable containing the registered extended user information.
 */
  public addCharacter(character: Character): Observable<ExtUser> {
    return this.authSvc.register(this.getCharacterCredentials(character));
  }

}