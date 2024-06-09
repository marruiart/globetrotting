import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { MappingService } from './mapping.service';
import { Client, NewClient, PaginatedClient } from '../../models/globetrotting/client.interface';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { StrapiEndpoints } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private body = (client: NewClient) => this.mapSvc.mapClientPayload(client);
  private queries: { [query: string]: string } = {
    "populate": "bookings,favorites.destination,user.role"
  }

  private _clientsPage: BehaviorSubject<PaginatedClient | null> = new BehaviorSubject<PaginatedClient | null>(null);
  public clientsPage$: Observable<PaginatedClient | null> = this._clientsPage.asObservable();
  private _clients: BehaviorSubject<Client[]> = new BehaviorSubject<Client[]>([]);
  public clients$: Observable<Client[]> = this._clients.asObservable();

  constructor(
    private dataSvc: DataService,
    private mapSvc: MappingService
  ) { }

  /**
 * Retrieves all clients with pagination.
 * 
 * @param {number | DocumentSnapshot<DocumentData> | null} [page=1] - The page number or DocumentSnapshot for pagination. If null, returns null.
 * @returns {Observable<PaginatedClient | null>} An observable of the paginated clients.
 */
  public getAllClients(page: number | DocumentSnapshot<DocumentData> | null = 1): Observable<PaginatedClient | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = { ...this.queries, ...{ "pagination[page]]": `${page}` } };
    return this.dataSvc.obtainAll<PaginatedClient>(StrapiEndpoints.CLIENTS, _queries, this.mapSvc.mapPaginatedClients)
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

  /**
 * Retrieves the next page of clients.
 * 
 * @returns {Observable<PaginatedClient | null>} An observable of the next paginated clients.
 */
  public getNextClientsPage(): Observable<PaginatedClient | null> {
    return this.getAllClients(this._clientsPage.value?.pagination.next);
  }

  /**
   * Finds the client with the id of the current user. If another user id is passed, the state of the application will be updated.
   * 
   * @param {number | null} currentUserId - The ID of the current user.
   * @returns {Observable<Client | null>} An observable of the client.
   */
  public clientMe(currentUserId: number | null): Observable<Client | null> {
    if (currentUserId) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user]"] = `${currentUserId}`;
      return this.dataSvc.obtainAll<PaginatedClient>(StrapiEndpoints.CLIENTS, _queries, this.mapSvc.mapPaginatedClients)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let clientMe = res.data[0];
            return clientMe;
          } else {
            return null;
          }
        }), catchError(() => throwError(() => 'ERROR: Unable to get the client.')))
    } else {
      return of(null);
    }
  }

  /**
 * Retrieves a specific client by their ID.
 * 
 * @param {string | number} id - The ID of the client to retrieve.
 * @returns {Observable<Client>} An observable of the client.
 */
  public getClient(id: string | number): Observable<Client> {
    return this.dataSvc.obtain<Client>(StrapiEndpoints.CLIENTS, id, this.mapSvc.mapClient, this.queries)
      .pipe(catchError(() => throwError(() => 'ERROR: Unable to get the client.')));
  }

  /**
 * Retrieves a client by their external user ID.
 * 
 * @param {number | string} user_id - The external user ID of the client to retrieve.
 * @returns {Observable<Client>} An observable of the client.
 */
  public getClientByExtUserId(user_id: number | string): Observable<Client> {
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["filters[user]"] = `${user_id}`;
    return this.dataSvc.obtainAll<Client[]>(StrapiEndpoints.CLIENTS, _queries, this.mapSvc.mapClients)
      .pipe(map(res => res[0]),
        catchError(() => throwError(() => 'ERROR: Unable to get the client.')));
  }

  /**
 * Adds a new client.
 * 
 * @param {NewClient} client - The new client to add.
 * @param {boolean} [updateObs=true] - Whether to update the observable after adding the client.
 * @returns {Observable<Client>} An observable of the added client.
 */
  public addClient(client: NewClient, updateObs: boolean = true): Observable<Client> {
    return this.dataSvc.save<Client>(StrapiEndpoints.CLIENTS, this.body(client), this.mapSvc.mapClient)
      .pipe(tap(_ => {
        if (updateObs) {
          this.getAllClients().subscribe();
        }
      }), catchError(() => throwError(() => 'ERROR: Unable to create the client.e')));
  }

  /**
 * Updates an existing client.
 * 
 * @param {Client} client - The client to update.
 * @param {boolean} [updateObs=true] - Whether to update the observable after updating the client.
 * @returns {Observable<Client>} An observable of the updated client.
 */
  public updateClient(client: Client, updateObs: boolean = true): Observable<Client> {
    return this.dataSvc.update<Client>(StrapiEndpoints.CLIENTS, client.id, this.body(client), this.mapSvc.mapClient)
      .pipe(tap(_ => {
        if (updateObs) {
          this.getAllClients().subscribe();
        }
      }), catchError(() => throwError(() => 'ERROR: Unable to update the client.')));
  }

  /**
 * Deletes a specific client by their ID.
 * 
 * @param {number} id - The ID of the client to delete.
 * @returns {Observable<Client>} An observable of the deleted client.
 */
  public deleteClient(id: number): Observable<Client> {
    return this.dataSvc.delete<Client>(StrapiEndpoints.CLIENTS, this.mapSvc.mapClient, id, {})
      .pipe(tap(_ => {
        this.getAllClients().subscribe();
      }), catchError(() => throwError(() => 'ERROR: Unable to delete the client.')));
  }
}
