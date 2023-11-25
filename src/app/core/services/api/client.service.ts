import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { AuthFacade } from '../../libs/auth/auth.facade';
import { Client, NewClient, PaginatedClient } from '../../models/globetrotting/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends ApiService {
  private path: string = "/api/clients";
  private queries: { [query: string]: string } = {
    "populate": "bookings,favorites.destination"
  }

  private _clientsPage: BehaviorSubject<PaginatedClient | null> = new BehaviorSubject<PaginatedClient | null>(null);
  public clientsPage$: Observable<PaginatedClient | null> = this._clientsPage.asObservable();
  private _clients: BehaviorSubject<Client[]> = new BehaviorSubject<Client[]>([]);
  public clients$: Observable<Client[]> = this._clients.asObservable();
  private _clientMe: BehaviorSubject<Client | null> = new BehaviorSubject<Client | null>(null);
  public clientMe$: Observable<Client | null> = this._clientMe.asObservable();

  private body: any = (client: Client) => {
    return {
      data: {
        bookings: client.bookings,
        favorites: client.favorites
      }
    }
  }

  constructor(
    private authFacade: AuthFacade,
    private mapSvc: MappingService
  ) {
    super();
  }

  public getAllClients(page: number | null = 1): Observable<PaginatedClient | null> {
    if (page == null) {
      return of(null);
    }
    this.queries["pagination[page]"] = `${page}`;
    return this.getAll<PaginatedClient>(this.path, this.queries, this.mapSvc.mapPaginatedClients)
      .pipe(tap((page: PaginatedClient) => {
        if (page.data.length > 0) {
          let _clients: Client[] = JSON.parse(JSON.stringify(page.data))
            .reduce((prev: Client[], data: Client): Client[] => {
              // Check if each of the new elements already existed, if not, push them into _clients
              if (this._clients.value.find(c => c.id == data.id) == undefined) {
                prev.push(data);
              }
              return prev;
            }, JSON.parse(JSON.stringify(this._clients.value)));
          this._clients.next(_clients);
          this._clientsPage.next(page);
        }
      }));
  }

  public getNextClientsPage(): Observable<PaginatedClient | null> {
    return this.getAllClients(this._clientsPage.value?.pagination.next);
  }

  public clientMe(id: number): Observable<Client | null> {
    if (id) {
      this.queries["filters[user_id]"] = `${id}`;
      return this.getAll<PaginatedClient>(this.path, this.queries, this.mapSvc.mapPaginatedClients)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let me = res.data[0];
            this._clientMe.next(me);
            return me;
          } else {
            return null;
          }
        }))
    } else {
      return of(null);
    }
  }

  public getClient(id: number): Observable<Client> {
    return this.get<Client>(this.path, id, this.mapSvc.mapClient, this.queries);
  }

  public addClient(client: NewClient, updateObs: boolean = true): Observable<Client> {
    return this.add<Client>(this.path, this.body(client), this.mapSvc.mapClient).pipe(tap(_ => {
      if (updateObs) {
        this.getAllClients().subscribe();
      }
    }));
  }

  public updateClient(client: Client, updateObs: boolean = true): Observable<Client> {
    return this.update<Client>(this.path, client.id, this.body(client), this.mapSvc.mapClient).pipe(tap(_ => {
      if (updateObs) {
        this.getAllClients().subscribe();
      }
    }));
  }

  public deleteClient(id: number): Observable<Client> {
    return this.delete<Client>(this.path, this.mapSvc.mapClient, id).pipe(tap(_ => {
      this.getAllClients().subscribe();
    }));;
  }
}
