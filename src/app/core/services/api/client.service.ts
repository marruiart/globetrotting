import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { MappingService } from './mapping.service';
import { Client, NewClient, PaginatedClient } from '../../models/globetrotting/client.interface';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private path: string = "/api/clients";
  private body = (client: NewClient) => this.mapSvc.mapClientPayload(client);
  private queries: { [query: string]: string } = {
    "populate": "bookings,favorites.destination,user"
  }

  private _clientsPage: BehaviorSubject<PaginatedClient | null> = new BehaviorSubject<PaginatedClient | null>(null);
  public clientsPage$: Observable<PaginatedClient | null> = this._clientsPage.asObservable();
  private _clients: BehaviorSubject<Client[]> = new BehaviorSubject<Client[]>([]);
  public clients$: Observable<Client[]> = this._clients.asObservable();

  constructor(
    private dataSvc: DataService,
    private mapSvc: MappingService
  ) { }

  public getAllClients(page: number | DocumentSnapshot<DocumentData> | null = 1): Observable<PaginatedClient | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]]"] = `${page}`;
    return this.dataSvc.obtainAll<PaginatedClient>(this.path, this.queries, this.mapSvc.mapPaginatedClients)
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
      }), catchError(() => throwError(() => 'No se han podido obtener los clientes')));
  }

  public getNextClientsPage(): Observable<PaginatedClient | null> {
    return this.getAllClients(this._clientsPage.value?.pagination.next);
  }

  /**
   * Find in the client table de user with the id of the current user. If another user id is passed, the state of the application will be updated!
   */
  public clientMe(currentUserId: number | null): Observable<Client | null> {
    if (currentUserId) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user]"] = `${currentUserId}`;
      return this.dataSvc.obtainAll<PaginatedClient>(this.path, _queries, this.mapSvc.mapPaginatedClients)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let clientMe = res.data[0];
            return clientMe;
          } else {
            return null;
          }
        }), catchError(() => throwError(() => 'No se ha podido obtener tu cliente')))
    } else {
      return of(null);
    }
  }

  public getClient(id: string | number): Observable<Client> {
    return this.dataSvc.obtain<Client>(this.path, id, this.mapSvc.mapClient, this.queries)
      .pipe(catchError(() => throwError(() => 'No se ha podido obtener el cliente')));
  }

  public getClientByExtUserId(user_id: number): Observable<Client> {
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["filters[user]"] = `${user_id}`;
    return this.dataSvc.obtainAll<Client[]>(this.path, _queries, this.mapSvc.mapClients)
      .pipe(map(res => res[0]),
        catchError(() => throwError(() => 'No se ha podido obtener el cliente')));
  }

  public addClient(client: NewClient, updateObs: boolean = true): Observable<Client> {
    return this.dataSvc.save<Client>(this.path, this.body(client), this.mapSvc.mapClient)
      .pipe(tap(_ => {
        if (updateObs) {
          this.getAllClients().subscribe();
        }
      }), catchError(() => throwError(() => 'No se ha podido añadir al cliente')));
  }

  public updateClient(client: Client, updateObs: boolean = true): Observable<Client> {
    return this.dataSvc.update<Client>(this.path, client.id, this.body(client), this.mapSvc.mapClient)
      .pipe(tap(_ => {
        if (updateObs) {
          this.getAllClients().subscribe();
        }
      }), catchError(() => throwError(() => 'No se ha podido modificar el cliente')));
  }

  public deleteClient(id: number): Observable<Client> {
    return this.dataSvc.delete<Client>(this.path, this.mapSvc.mapClient, id, {})
      .pipe(tap(_ => {
        this.getAllClients().subscribe();
      }), catchError(() => throwError(() => 'No se ha podido eliminar al cliente')));
  }
}
