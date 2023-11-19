import { Injectable } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Character } from '../../../models/rick-morty-api/character.interface';
import { HttpService } from '../../http/http.service';
import { DestinationsService } from '../destinations.service';
import { Destination, NewDestination } from '../../../models/globetrotting/destination.interface';
import { Page } from 'src/app/core/models/rick-morty-api/pagination';
import { NewUser, User, UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { UsersService } from '../users.service';
import { AuthService } from '../../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class CharactersApiService {

  constructor(
    private http: HttpService,
    private authSvc: AuthService,
    private userSvc: UsersService
  ) { }

  public getAllFromApi(allPages: Page<Character>[] = [], url: string = `${environment.API_URL}/character`): Observable<Page<Character>[]> {
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
    let _username = character.name.replace(/\s/g, '').toLowerCase();
    return {
      username: `${_username}`,
      email: `${_username}@gmail.com`,
      password: "123456"
    }
  }

  public addCharacter(character: Character): Observable<User> {
    return this.authSvc.register(this.getCharacterCredentials(character));
  }

}